document.addEventListener("DOMContentLoaded", function() {

    // HTML'deki elemanları seç
    const usernameSpan = document.getElementById("profile-username");
    const emailSpan = document.getElementById("profile-email");
    const logoutButton = document.getElementById("logoutButton");

    // Ana fonksiyon: Kullanıcının giriş durumunu kontrol et ve verileri getir
    function checkLoginStatusAndFetchProfile() {
        
       
        
        fetch('/api/profile/me', { // <-- Java controller'ınızdaki adres
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
               
            },
         
            credentials: 'include' 
        })
        .then(response => {
            
            if (response.status === 401 || response.status === 403) {
                
                throw new Error('Yetkisiz erişim. Giriş sayfasına yönlendiriliyor.');
            }
            
            if (!response.ok) {
                throw new Error('Profil bilgileri alınamadı.');
            }
            
            return response.json();
        })
        .then(data => {
            
            usernameSpan.textContent = data.username;
            emailSpan.textContent = data.email;
            
            
            usernameSpan.classList.remove('loading-placeholder');
            emailSpan.classList.remove('loading-placeholder');
        })
        .catch(error => {
           
            console.error('Profil yüklenirken hata oluştu:', error.message);
            
            
            window.location.href = 'index.html';
        });
    }

    // 6. ÇIKIŞ YAP (LOGOUT) BUTONU (Komple Değişti)
    logoutButton.addEventListener('click', function() {
        
        // (DEĞİŞİKLİK) Token silmek yerine, backend'deki
        // oturum sonlandırma endpoint'ine (genellikle /logout)
        // bir POST isteği atarız.
        
        fetch('/logout', { // <-- Spring Security'nin varsayılan logout adresi
            method: 'POST',
            credentials: 'include' 
        })
        .then(response => {
           
            console.log('Oturum sonlandırma isteği gönderildi.');
        })
        .catch(error => {
            console.error('Logout hatası:', error);
        })
        .finally(() => {
            // Her durumda (başarılı veya hatalı) kullanıcıyı
            // giriş sayfasına yönlendir.
            window.location.href = 'login.html';
        });
    });

    // Sayfa yüklendiğinde ana fonksiyonu çalıştır
    checkLoginStatusAndFetchProfile();
});