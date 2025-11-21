import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Başlık */}
      <Text style={styles.title}>Odaklanma Seansı</Text>

      {/* Sayaç Dairesi ve Süre */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>25:00</Text>
        <Text style={styles.statusText}>Hazır mısın?</Text>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.startButton]}>
          <Text style={styles.buttonText}>Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.pauseButton]}>
          <Text style={styles.buttonText}>Duraklat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tasarım (CSS benzeri) Kodları
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
    borderRadius: 125, // Tam daire yapmak için genişliğin yarısı
    borderWidth: 5,
    borderColor: '#4A90E2', // Mavi çerçeve
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
    flexDirection: 'row', // Butonları yan yana diz
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50', // Yeşil
  },
  pauseButton: {
    backgroundColor: '#FF9800', // Turuncu
  },
  resetButton: {
    backgroundColor: '#F44336', // Kırmızı
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});