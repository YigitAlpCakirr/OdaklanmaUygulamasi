# 🎯 Odaklanma ve Takip Uygulaması 

Bu proje, Sakarya Üniversitesi Bilgisayar Mühendisliği Mobil Uygulama Geliştirme dersi dönem ödevi olarak geliştirilmiştir.

## 📱 Proje Hakkında
Günümüzdeki dijital dikkat dağınıklığı ile mücadele etmek amacıyla geliştirilen bu uygulama, Pomodoro tekniği benzeri bir yaklaşımla kullanıcıların odaklanma sürelerini takip eder.

## ✨ Özellikler

* **Özelleştirilebilir Sayaç:** Kullanıcı saat ve dakika bazında hedef süresini kendi belirleyebilir.
* **Kategori Yönetimi:** Ders, Kodlama, Tasarım, Kitap Okuma gibi farklı kategorilerde çalışma imkanı.
* **Dikkat Dağınıklığı Takibi (AppState):** Uygulama arka plana atıldığında (başka uygulamaya geçildiğinde) bu durum "dikkat dağınıklığı" olarak kaydedilir.
* **Detaylı Raporlar:** * Günlük ve Toplam Çalışma Süreleri
    * Kategori Bazlı Yüzdelik Dağılım (Pasta Grafik)
    * Son 7 Günlük Performans (Çubuk Grafik)
    * Son 10 Oturum Geçmişi Listesi 
* **Veri Kaydı :** Tüm veriler `AsyncStorage` kullanılarak cihazda saklanır.

## 🛠 Kullanılan Teknolojiler

* **React Native (Expo)**
* **React Navigation** (Tab Navigator)
* **AsyncStorage** (Veri Saklama)
* **React Native Chart Kit** (Grafikler)
* **Expo Vector Icons**

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  Repoyu klonlayın:
    ```bash
    git clone [https://github.com/YigitAlpCakirr/OdaklanmaUygulamasi.git](https://github.com/YigitAlpCakirr/OdaklanmaUygulamasi.git)
    ```

2.  Proje dizinine gidin:
    ```bash
    cd OdaklanmaUygulamasi
    ```

3.  Gerekli paketleri yükleyin:
    ```bash
    npm install
    ```

4.  Uygulamayı başlatın:
    ```bash
    npx expo start
    ```

## 👤 Geliştirici
* **Ad Soyad:** [Yiğit Alp ÇAKIR]
* **Numara:** [G231210387]