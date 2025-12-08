import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { clearAllSessions, getFocusSessions } from '../utils/storage';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0,
    pieData: [],
    barData: { labels: [], datasets: [{ data: [] }] }
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getFocusSessions();
    setSessions(data); 
    calculateStats(data);
  };

  const handleClearData = async () => {
    Alert.alert(
      "Verileri Temizle",
      "Emin misiniz? Tüm istatistikler sıfırlanacak.",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: async () => {
            await clearAllSessions();
            loadData();
          }
        }
      ]
    );
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "0s0dk";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}s${minutes}dk`;
  };

  const calculateStats = (data) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let todaySeconds = 0;
    let totalSeconds = 0;
    let totalDistraction = 0;
    const categoryMap = {}; 
    const last7DaysMap = {}; 

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' }); 
      last7DaysMap[dateKey] = { label: dayName, value: 0 };
    }

    data.forEach(session => {
      const sessionDateStr = session.date.split('T')[0];
      
      totalSeconds += session.duration;
      totalDistraction += session.distractionCount || 0;

      if (sessionDateStr === todayStr) {
        todaySeconds += session.duration;
      }

      if (categoryMap[session.category]) {
        categoryMap[session.category] += session.duration;
      } else {
        categoryMap[session.category] = session.duration;
      }

      if (last7DaysMap[sessionDateStr]) {
        last7DaysMap[sessionDateStr].value += session.duration;
      }
    });

    const pieColors = ['#ff7675', '#74b9ff', '#55efc4', '#a29bfe', '#ffeaa7', '#fab1a0'];
    const pieChartData = Object.keys(categoryMap).map((cat, index) => {
      const catSeconds = categoryMap[cat];
      const percentage = totalSeconds > 0 ? Math.round((catSeconds / totalSeconds) * 100) : 0;
      
      return {
        name: cat, 
        population: catSeconds, 
        color: pieColors[index % pieColors.length],
        legendFontColor: "#7f7f7f",
        legendFontSize: 12,
        percentage: percentage 
      };
    });

    const barLabels = Object.values(last7DaysMap).map(item => item.label);
    const barValues = Object.values(last7DaysMap).map(item => parseFloat((item.value / 60).toFixed(1))); 

    setStats({
      todayFocus: todaySeconds,
      totalFocus: totalSeconds,
      totalDistractions: totalDistraction,
      pieData: pieChartData,
      barData: {
        labels: barLabels,
        datasets: [{ data: barValues }]
      }
    });
  };

  // --- SON 10 SEANSI ALMA ---

  const lastSessions = sessions.slice().reverse().slice(0, 10);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistik Paneli</Text>

      {/* ÖZET KARTLAR */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bugün</Text>
          <Text style={styles.cardValue}>{formatDuration(stats.todayFocus)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam</Text>
          <Text style={styles.cardValue}>{formatDuration(stats.totalFocus)}</Text>
        </View>
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.cardTitle}>Odak Kaybı</Text>
          <Text style={[styles.cardValue, styles.dangerText]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* 1. PASTA GRAFİK */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      
      {stats.pieData.length > 0 ? (
        <View style={styles.pieContainer}>
          <PieChart
            data={stats.pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={(screenWidth / 4).toString()} 
            hasLegend={false} 
            absolute={false}
          />
          <View style={styles.customLegendContainer}>
            {stats.pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  %{item.percentage} {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok.</Text>
      )}

      {/* 2. ÇUBUK GRAFİK */}
      <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
      <BarChart
        data={stats.barData}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        yAxisSuffix="" 
        chartConfig={chartConfig}
        style={styles.barChart}
        fromZero
      />

      {/* 3. SON 10 SEANS LİSTESİ */}
      <Text style={styles.chartTitle}>Son 10 Oturum</Text>
      <View style={styles.historyContainer}>
        {lastSessions.length > 0 ? (
          lastSessions.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              {/* Sol Taraf: Kategori ve Tarih */}
              <View>
                <Text style={styles.historyCategory}>{item.category}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.date).toLocaleDateString('tr-TR')} • {new Date(item.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>

              {/* Sağ Taraf: Süre ve Odak Kaybı */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.historyDuration}>{formatDuration(item.duration)}</Text>
                {item.distractionCount > 0 ? (
                  <Text style={styles.historyDistractionError}>⚠️ {item.distractionCount} Kayıp</Text>
                ) : (
                  <Text style={styles.historyDistractionSuccess}>✨ Tam Odak</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Henüz oturum kaydı bulunmuyor.</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
        <Text style={styles.clearButtonText}>Verileri Sıfırla</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0, 
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.7,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { backgroundColor: '#fff', width: '30%', padding: 10, borderRadius: 10, alignItems: 'center', elevation: 3 },
  cardTitle: { fontSize: 12, color: '#888', marginBottom: 5 },
  cardValue: { fontSize: 15, fontWeight: 'bold', color: '#333' }, 
  dangerCard: { borderColor: '#ff7675', borderWidth: 1 },
  dangerText: { color: '#d63031' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 20, color: '#444' },
  
  pieContainer: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 10, elevation: 2 },
  
  customLegendContainer: {
    width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 15
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, minWidth: '40%' },
  legendColorBox: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 14, color: '#555', fontWeight: '600' },

  barChart: { borderRadius: 16, marginVertical: 8 },
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20 },
  
  historyContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 10, elevation: 2 },
  historyItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  historyCategory: { fontSize: 16, fontWeight: '600', color: '#333' },
  historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
  historyDuration: { fontSize: 16, fontWeight: 'bold', color: '#4A90E2' },
  historyDistractionError: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  historyDistractionSuccess: { fontSize: 12, color: '#2ecc71', fontWeight: '600' },

  clearButton: { backgroundColor: '#ff4757', padding: 15, borderRadius: 10, marginTop: 30, marginBottom: 40, alignItems: 'center' },
  clearButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});