import { useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // --- DEĞİŞKENLER (STATE) ---
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Ders Çalışma');
  
  const [distractionCount, setDistractionCount] = useState(0);

  const appState = useRef(AppState.currentState);

  const CATEGORIES = [
    'Ders Çalışma', 
    'Kodlama', 
    'Tasarım',
    'Yabancı Dil',
    'Kitap Okuma', 
    'Spor'
  ];

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Eğer uygulama arka plana (background) atılırsa ve sayaç çalışıyorsa:
      if (
        appState.current.match(/active/) && 
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (isActive) {
          setIsActive(false); // Sayacı durdur
          setDistractionCount(prev => prev + 1); // Ceza puanı ekle
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // --- SAYAÇ MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      alert(`${selectedCategory} süresi doldu!`);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // --- YARDIMCI FONKSİYONLAR ---
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
    setDistractionCount(0); // Sayacı sıfırlarken cezaları da sil
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Seansı</Text>

      {/* Kategori Seçim Alanı */}
      <View style={styles.categoryWrapper}>
        <Text style={styles.label}>Ne üzerinde çalışıyorsun?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, selectedCategory === cat && styles.selectedCatButton]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.selectedCatText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sayaç Dairesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.statusText}>
          {isActive ? "Odaklanılıyor..." : "Hazır mısın?"}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Odak Bozulma: <Text style={styles.errorText}>{distractionCount}</Text></Text>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.pauseButton : styles.startButton]} 
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  categoryWrapper: {
    height: 80,
    marginBottom: 10,
    alignItems: 'center',
  },
  label: { fontSize: 14, color: '#888', marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 10 },
  catButton: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd', height: 40,
  },
  selectedCatButton: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  catText: { color: '#555', fontSize: 14 },
  selectedCatText: { color: '#fff', fontWeight: 'bold' },
  
  timerContainer: {
    width: 240, height: 240, borderRadius: 120, borderWidth: 5, borderColor: '#4A90E2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#f0f8ff',
  },
  timerText: { fontSize: 55, fontWeight: 'bold', color: '#333' },
  statusText: { fontSize: 14, color: '#666', marginTop: 10 },

  statsContainer: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2'
  },
  statsText: { fontSize: 16, color: '#555' },
  errorText: { color: 'red', fontWeight: 'bold', fontSize: 18 },

  buttonContainer: { flexDirection: 'row', gap: 15 },
  button: {
    paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, minWidth: 120, alignItems: 'center',
  },
  startButton: { backgroundColor: '#4CAF50' },
  pauseButton: { backgroundColor: '#FF9800' },
  resetButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});