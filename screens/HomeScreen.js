import { Picker } from '@react-native-picker/picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { saveFocusSession } from '../utils/storage';

const { width } = Dimensions.get('window');
const PICKER_WIDTH = width * 0.4; 

export default function HomeScreen() {
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(25); 
  
  const [initialDuration, setInitialDuration] = useState(25 * 60); 
  const [seconds, setSeconds] = useState(25 * 60); 
  
  const [isActive, setIsActive] = useState(false);            
  const [isSessionStarted, setIsSessionStarted] = useState(false); 
  
  const [selectedCategory, setSelectedCategory] = useState('Ders Çalışma');
  const [distractionCount, setDistractionCount] = useState(0);

  const appState = useRef(AppState.currentState);

  const CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Tasarım', 'Kitap Okuma', 'Spor'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // --- APP STATE ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isSessionStarted && appState.current.match(/active/) && (nextAppState === 'background' || nextAppState === 'inactive')) {
        if (isActive) {
          setIsActive(false);
          setDistractionCount(prev => prev + 1);
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive, isSessionStarted]);

  // --- SAYAÇ ---
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0 && isSessionStarted) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isSessionStarted]);

  // --- BAŞLATMA ---
  const handleStartTimer = () => {
    if (isSessionStarted) {
      setIsActive(!isActive);
      return;
    }

    const totalSeconds = (selectedHours * 3600) + (selectedMinutes * 60);
    
    if (totalSeconds === 0) {
      Alert.alert("Uyarı", "Lütfen süreyi en az 1 dakika seçin.");
      return;
    }

    setInitialDuration(totalSeconds);
    setSeconds(totalSeconds);
    setIsActive(true);
    setIsSessionStarted(true);
    setDistractionCount(0);
  };

  // --- SIFIRLAMA ---
  const handleReset = () => {
    setIsActive(false);
    setIsSessionStarted(false);
    const totalSeconds = (selectedHours * 3600) + (selectedMinutes * 60);
    setInitialDuration(totalSeconds);
    setSeconds(totalSeconds);
    setDistractionCount(0);
  };

  // --- BİTİRME ---
  const handleSessionComplete = async () => {
    setIsActive(false);

    const sessionData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: selectedCategory,
      duration: initialDuration, 
      distractionCount: distractionCount,
      status: 'Completed'
    };

    await saveFocusSession(sessionData);

    Alert.alert(
      "Tebrikler!",
      `Oturum tamamlandı.\nKategori: ${selectedCategory}`,
      [{ 
        text: "Tamam", 
        onPress: () => {
          setIsSessionStarted(false);
          handleReset();
        } 
      }]
    );
  };

  const formatTime = (timeInSeconds) => {
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = timeInSeconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Odaklanma Seansı</Text>
        <Text style={styles.subtitle}>Hedefini seç ve çalışmaya başla</Text>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionLabel}>KATEGORİ</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, selectedCategory === cat && styles.selectedCatButton]}
              onPress={() => !isSessionStarted && setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.selectedCatText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mainContent}>
        
        {isSessionStarted ? (
          <View style={styles.timerContainer}>
             <View style={[styles.timerCircle, isActive ? styles.activeBorder : styles.pausedBorder]}>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                <Text style={styles.statusText}>{isActive ? "🔥 Odaklanılıyor" : "⏸️ Duraklatıldı"}</Text>
             </View>
             
             <View style={styles.statsBadge}>
               <Text style={styles.statsLabel}>Dikkat Dağınıklığı</Text>
               <Text style={styles.statsValue}>{distractionCount}</Text>
             </View>
          </View>
        ) : (
          <View style={styles.pickerCard}>
            
            {/* SAAT SÜTUNU */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerHeader}>SAAT</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  key={`hours-${isSessionStarted}`} 
                  selectedValue={selectedHours}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={(val) => setSelectedHours(val)}
                >
                  {hours.map((h) => <Picker.Item key={h} label={`${h}`} value={h} />)}
                </Picker>
              </View>
            </View>

            <Text style={styles.colon}>:</Text>

            {/* DAKİKA SÜTUNU */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerHeader}>DAKİKA</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  key={`minutes-${isSessionStarted}`} 
                  selectedValue={selectedMinutes}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={(val) => setSelectedMinutes(val)}
                >
                  {minutes.map((m) => <Picker.Item key={m} label={`${m < 10 ? '0' + m : m}`} value={m} />)}
                </Picker>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.mainButton, (isSessionStarted && isActive) ? styles.pauseBtnColor : styles.startBtnColor]} 
          onPress={handleStartTimer}
        >
          <Text style={styles.mainButtonText}>
            {!isSessionStarted ? "BAŞLAT" : (isActive ? "DURAKLAT" : "DEVAM ET")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetGhostButton} onPress={handleReset}>
          <Text style={styles.resetGhostText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
  
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  categorySection: { marginBottom: 20 },
  sectionLabel: { paddingHorizontal: 20, fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  categoryScroll: { paddingHorizontal: 20, paddingRight: 10 },
  catButton: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12,
    backgroundColor: '#FFFFFF', marginRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  selectedCatButton: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  catText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  selectedCatText: { color: '#FFFFFF' },

  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  pickerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#FFFFFF',
    width: width - 40,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 10,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  
  // --- KRİTİK DEĞİŞİKLİK: SABİT GENİŞLİK ---
  pickerColumn: { 
    width: PICKER_WIDTH, 
    alignItems: 'center',
    justifyContent: 'center' 
  },
  
  pickerHeader: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 15 },
  
  pickerWrapper: { 
    height: 220, 
    width: '100%', 
    overflow: 'hidden', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  picker: { width: '100%', height: 220 }, 
  pickerItem: { fontSize: 26, color: '#1F2937' },
  
  colon: { fontSize: 40, fontWeight: '300', color: '#D1D5DB', marginTop: 10, marginHorizontal: 5 },

  timerContainer: { alignItems: 'center' },
  timerCircle: {
    width: 260, height: 260, borderRadius: 130,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    marginBottom: 30
  },
  activeBorder: { borderColor: '#4F46E5' },
  pausedBorder: { borderColor: '#F59E0B' },
  timerText: { fontSize: 64, fontWeight: '900', color: '#111827', fontVariant: ['tabular-nums'] },
  statusText: { fontSize: 16, fontWeight: '500', color: '#6B7280', marginTop: 5 },
  
  statsBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, 
    backgroundColor: '#FEF2F2', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#FECACA'
  },
  statsLabel: { fontSize: 14, color: '#991B1B', fontWeight: '500' },
  statsValue: { fontSize: 18, fontWeight: 'bold', color: '#DC2626' },

  buttonContainer: { 
    padding: 20, paddingBottom: 40, width: '100%', 
    flexDirection: 'column', gap: 15 
  },
  mainButton: {
    width: '100%', paddingVertical: 18, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  startBtnColor: { backgroundColor: '#4F46E5' },
  pauseBtnColor: { backgroundColor: '#F59E0B' },
  mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

  resetGhostButton: { alignItems: 'center', padding: 10 },
  resetGhostText: { color: '#EF4444', fontSize: 16, fontWeight: '600' }
});