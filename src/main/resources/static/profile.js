document.addEventListener('DOMContentLoaded', function() {
    // HTML elemanlarını seçme
    const nameSpan = document.getElementById("profile-name"); // profile-username yerine profile-name kullanıldı
    const surnameSpan = document.getElementById("profile-surname"); // Yeni
    const emailSpan = document.getElementById("profile-email");
    const ageSpan = document.getElementById("profile-age"); // Yeni
    const addressSpan = document.getElementById("profile-address"); // Yeni
    const logoutButton = document.getElementById("logoutButton");

    // Ana fonksiyon: Kullanıcının giriş durumunu kontrol et ve verileri getir
    function checkLoginStatusAndFetchProfile() {
        
        fetch('/user-dashboard/userService', { // <-- Java controller'ınızdaki adres
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' 
        })
        .then(response => {
            
            if (response.status === 401 || response.status === 403) {
                // Eğer oturum yoksa, giriş sayfasına yönlendir.
                throw new Error('Yetkisiz erişim. Giriş sayfasına yönlendiriliyor.');
            }
            
            if (!response.ok) {
                throw new Error('Profil bilgileri alınamadı.');
            }
            
            return response.json();
        })
        .then(data => {
            // Gelen verileri DOM'a yerleştir
            nameSpan.textContent = data.name;
            surnameSpan.textContent = data.surname; // Yeni alan
            emailSpan.textContent = data.email;
            ageSpan.textContent = data.age; // Yeni alan
            addressSpan.textContent = data.address; // Yeni alan
            
            // Yükleniyor Placeholder'larını kaldır
            nameSpan.classList.remove('loading-placeholder');
            surnameSpan.classList.remove('loading-placeholder');
            emailSpan.classList.remove('loading-placeholder');
            ageSpan.classList.remove('loading-placeholder');
            addressSpan.classList.remove('loading-placeholder');
        })
        .catch(error => {
            
            console.error('Profil yüklenirken hata oluştu:', error.message);
            
            // Hata oluşursa (özellikle 401/403) kullanıcıyı giriş sayfasına yönlendir
            window.location.href = '/treffpunkt/dashboard'; // veya 'login.html'
        });
    }

    // ÇIKIŞ YAP (LOGOUT) BUTONU
    logoutButton.addEventListener('click', function() {
        
        fetch('/logout', { // <-- Spring Security'nin varsayılan logout adresi
            method: 'POST',
            credentials: 'include' 
        })
        .then(response => {
            // Oturum sonlandırma isteği genellikle 302 veya 200 döner.
            console.log('Oturum sonlandırma isteği gönderildi.');
        })
        .catch(error => {
            console.error('Logout hatası:', error);
            // Hata olsa bile yönlendirme yap.
        })
        .finally(() => {
            // Her durumda kullanıcıyı giriş sayfasına yönlendir.
            window.location.href = '/treffpunkt/profile'; // Veya hangi sayfanız varsa
        });
    });

    // Sayfa yüklendiğinde ana fonksiyonu çalıştır
    checkLoginStatusAndFetchProfile();
});