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
        const loginData = {
            id: id,
            password: password
        };

        // 5. fetch API kullanarak Spring Backend'e POST isteği gönder
        fetch('/treffpunkt/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData) // JavaScript objesini JSON string'ine çevir
        })
        .then(response => {
            // 6. Cevabı kontrol et
            if (!response.ok) {
                // Eğer cevap 401 (Unauthorized) veya başka bir hata ise
                // Hata fırlat, bu .catch() bloğunu tetikleyecektir.
                throw new Error('Giriş başarısız');
            }
            // Cevap başarılıysa (200 OK), JSON verisini işle
            return response.json();
        })
        .then(data => {
            // 7. Başarılı giriş sonrası
            console.log('Giriş başarılı:', data);
            
            // Backend'den gelen token'ı (varsa) localStorage'a kaydet
            // Spring Security JWT ile genelde bir "token" veya "jwt" alanı döner
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }

            // Kullanıcıyı profil sayfasına yönlendir
            window.location.href = '/profil.html'; 
        })
        .catch(error => {
            // 8. Hata durumunda (network hatası veya response.ok == false)
            console.error('Giriş hatası:', error);
            errorMessage.textContent = 'Email veya şifre hatalı. Lütfen tekrar deneyin.';
        });
    });
});