import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Yeni bir seansı kaydetme fonksiyonu
export const saveFocusSession = async (sessionData) => {
  try {
    // Mevcut listeyi çek
    const existingData = await AsyncStorage.getItem('focusSessions');
    let sessions = existingData ? JSON.parse(existingData) : [];

    // Yeni veriyi ekle
    sessions.push(sessionData);

    // Güncel listeyi tekrar kaydet
    await AsyncStorage.setItem('focusSessions', JSON.stringify(sessions));
    console.log('Seans kaydedildi:', sessionData);
  } catch (error) {
    console.error('Kaydetme hatası:', error);
  }
};

// 2. Kayıtlı seansları okuma fonksiyonu (Raporlar ekranı için)
export const getFocusSessions = async () => {
  try {
    const data = await AsyncStorage.getItem('focusSessions');
    return data != null ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Okuma hatası:', error);
    return [];
  }
};

// 3. (Opsiyonel) Tüm verileri temizleme - Test ederken işine yarar
export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem('focusSessions');
  } catch(e) {
    // hata yok sayılabilir
  }
};