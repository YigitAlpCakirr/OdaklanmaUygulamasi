import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { clearAllSessions, getFocusSessions } from '../utils/storage';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
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

  const calculateStats = (data) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let todaySeconds = 0;
    let totalSeconds = 0;
    let totalDistraction = 0;
    const categoryMap = {}; 
    const last7DaysMap = {}; 

    // Son 7 gün şablonu
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' }); 
      last7DaysMap[dateKey] = { label: dayName, value: 0 };
    }

    // Verileri işle
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

    // --- PASTA GRAFİĞİ (YÜZDELİK HESAPLAMA) ---
    const pieColors = ['#ff7675', '#74b9ff', '#55efc4', '#a29bfe', '#ffeaa7', '#fab1a0'];
    const pieChartData = Object.keys(categoryMap).map((cat, index) => {
      const catSeconds = categoryMap[cat];
      const percentage = totalSeconds > 0 ? ((catSeconds / totalSeconds) * 100).toFixed(1) : 0;
      
      return {
        name: `${cat} (%${percentage})`, 
        population: parseFloat((catSeconds / 60).toFixed(2)), 
        color: pieColors[index % pieColors.length],
        legendFontColor: "#7f7f7f",
        legendFontSize: 12
      };
    });

    // --- ÇUBUK GRAFİK (DAKİKA) ---
    const barLabels = Object.values(last7DaysMap).map(item => item.label);
    const barValues = Object.values(last7DaysMap).map(item => parseFloat((item.value / 60).toFixed(1))); 

    setStats({
      todayFocus: (todaySeconds / 60).toFixed(1), 
      totalFocus: (totalSeconds / 60).toFixed(1), 
      totalDistractions: totalDistraction,
      pieData: pieChartData,
      barData: {
        labels: barLabels,
        datasets: [{ data: barValues }]
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistik Paneli</Text>

      {/* ÖZET KARTLAR */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bugün</Text>
          <Text style={styles.cardValue}>{stats.todayFocus} dk</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam</Text>
          <Text style={styles.cardValue}>{stats.totalFocus} dk</Text>
        </View>
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.cardTitle}>Odak Kaybı</Text>
          <Text style={[styles.cardValue, styles.dangerText]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* 1. PASTA GRAFİK (YÜZDELİK) */}
      <Text style={styles.chartTitle}>Kategori Dağılımı (%)</Text>
      {stats.pieData.length > 0 ? (
        <PieChart
          data={stats.pieData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute 
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok.</Text>
      )}

      {/* 2. ÇUBUK GRAFİK (DAKİKA) */}
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
      
      <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
        <Text style={styles.clearButtonText}>Verileri Sıfırla</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1, 
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
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#333' }, 
  dangerCard: { borderColor: '#ff7675', borderWidth: 1 },
  dangerText: { color: '#d63031' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10, color: '#444' },
  barChart: { borderRadius: 16, marginVertical: 8 },
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20 },
  
  clearButton: { backgroundColor: '#ff4757', padding: 15, borderRadius: 10, marginTop: 20, marginBottom: 40, alignItems: 'center' },
  clearButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});