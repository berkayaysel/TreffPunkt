document.addEventListener("DOMContentLoaded", function() {
    
    // HTML'deki ilgili elemanları seçiyoruz
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    // Forma "submit" olayı eklendiğinde çalışacak fonksiyon
    loginForm.addEventListener("submit", function(event) {
        
        // 1. Formun varsayılan "sayfayı yenileme" davranışını engelle
        event.preventDefault();

        // 2. Input alanlarındaki değerleri al
        const email = emailInput.value;
        const password = passwordInput.value;

        // 3. Hata mesajını temizle
        errorMessage.textContent = "";

        // 4. Backend'e göndermek için veriyi hazırla (JSON objesi)
        //    !!!! HATA BURADAYDI: 'id' yerine 'email' kullanılmalı !!!!
        const loginData = {
            email: email,
            password: password
        };

        // 5. fetch API kullanarak Spring Backend'e POST isteği gönder
        fetch('/auth/login', { 
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData), // JavaScript objesini JSON string'ine çevir
        credentials: 'include' 
        })
        .then(response => {
            // 6. Cevabı kontrol et
            if (!response.ok) {
                // Eğer cevap 401 (Unauthorized) veya başka bir hata ise
                // Hata fırlat, bu .catch() bloğunu tetikleyecektir.
                throw new Error('Giriş başarısız');
            }

            // Başarılıysa (genellikle 200 OK), backend'in
            // 'Set-Cookie' header'ını tarayıcı otomatik olarak işleyecek.
            // Cevap gövdesini (data) kullanmamıza gerek yok, ama yine de işleyebiliriz.
            return response.json(); 
        })
        .then(data => {
            // 7. Başarılı giriş sonrası
            console.log('Giriş başarılı:', data);
            
            // !!!! KALDIRILDI: 'localStorage.setItem' JWT içindir, biz session cookie kullanıyoruz.
            // Bu yüzden bu satıra gerek yok.

            // Kullanıcıyı profil sayfasına yönlendir
            // **ÖNEMLİ**: Profil sayfanızın adının 'profil.html' olduğundan emin olun
            window.location.href = '/user-dashboard';
        })
        .catch(error => {
            // 8. Hata durumunda (network hatası veya response.ok == false)
            console.error('Giriş hatası:', error);
            errorMessage.textContent = 'Email veya şifre hatalı. Lütfen tekrar deneyin.';
        });
    });
});