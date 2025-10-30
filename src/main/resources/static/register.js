document.addEventListener("DOMContentLoaded", function() {
    
    // HTML'deki ilgili elemanları seçiyoruz
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("name");
    const surnameInput = document.getElementById("surname");
    const addressInput = document.getElementById("address");
    const ageInput = document.getElementById("age")
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const errorMessage = document.getElementById("error-message");
    

    // Forma "submit" olayı eklendiğinde çalışacak fonksiyon
    registerForm.addEventListener("submit", function(event) {
        
        event.preventDefault(); // Sayfayı yenilemeyi engelle

        // Input'lardaki değerleri al
        const name = nameInput.value;
        const surname =surnameInput.value;
        const address= addressInput.value;
        const age = ageInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Hata mesajını temizle
        errorMessage.textContent = "";
        errorMessage.classList.remove("success-message"); 

        // Frontend Şifre Kontrolü
        if (password !== confirmPassword) {
            errorMessage.textContent = "Girdiğiniz şifreler eşleşmiyor.";
            return; 
        }

        // Backend'e göndermek için veriyi hazırla
        const registerData = {
            name: name,
            surname:surname,
            address:address,
            age:age,
            email: email,
            password: password
        };

        // fetch API kullanarak Spring Backend'e POST isteği gönder
        fetch('/auth/register', { // <-- Register endpoint'iniz
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            if (!response.ok) {
                // Email/kullanıcı adı zaten varsa vb.
                throw new Error('Kayıt başarısız. Bilgilerinizi kontrol edin.');
            }
            return response.json();
        })
        .then(data => {
            // Başarılı kayıt sonrası
            errorMessage.textContent = "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...";
            errorMessage.classList.add("success-message");

            // 2 saniye bekledikten sonra GİRİŞ sayfasına yönlendir
            setTimeout(() => {
                window.location.href = 'login.html'; // Giriş sayfasının adı
            }, 2000); 
        })
        .catch(error => {
            // Hata durumunda
            console.error('Kayıt hatası:', error);
            errorMessage.textContent = error.message;
        });
    });
});