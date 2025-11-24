import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // --- DEĞİŞKENLER (STATE) ---
  // Varsayılan süre 25 dakika (25 * 60 saniye)
  const [seconds, setSeconds] = useState(25 * 60);
  // Sayaç çalışıyor mu? (Başlangıçta hayır)
  const [isActive, setIsActive] = useState(false);

  // --- SAYAÇ MANTIĞI ---
  useEffect(() => {
    let interval = null;

    // Eğer sayaç aktifse ve süre bitmediyse her 1 saniyede bir azalt
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Süre bittiyse durdur
      setIsActive(false);
      alert("Süre doldu! Tebrikler.");
    }

    // Temizlik işlemi 
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // --- YARDIMCI FONKSİYONLAR ---
  
  // Saniyeyi "25:00" formatına çeviren fonksiyon
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    // 10'dan küçükse başına 0 koy
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Başlat / Duraklat butonu 
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Sıfırla butonu 
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60); // Tekrar 25 dakikaya döner
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Seansı</Text>

      {/* Sayaç Dairesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        
        <Text style={styles.statusText}>
          {isActive ? "Odaklanılıyor..." : "Hazır mısın?"}
        </Text>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        {/* Başlat Butonu (Aktifse 'Duraklat' yazar değilse 'Başlat') */}
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.pauseButton : styles.startButton]} 
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>
            {isActive ? "Duraklat" : "Başlat"}
          </Text>
        </TouchableOpacity>

        {/* Sıfırla Butonu */}
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetTimer}
        >
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  timerContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 5,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#f0f8ff',
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50', 
  },
  pauseButton: {
    backgroundColor: '#FF9800', 
  },
  resetButton: {
    backgroundColor: '#F44336', 
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});