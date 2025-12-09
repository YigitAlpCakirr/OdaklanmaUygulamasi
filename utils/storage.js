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

// 3. Tüm verileri temizleme 
export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem('focusSessions');
  } catch(e) {
  }
};

// ID'si verilen oturumu siler
export const deleteFocusSession = async (sessionId) => {
  try {
    const existingData = await AsyncStorage.getItem('focusSessions');
    let sessions = existingData ? JSON.parse(existingData) : [];
    
    const newSessions = sessions.filter(item => item.id !== sessionId);
    
    await AsyncStorage.setItem('focusSessions', JSON.stringify(newSessions));
    console.log("Oturum silindi:", sessionId);
  } catch (e) {
    console.error("Silme hatası:", e);
  }
};