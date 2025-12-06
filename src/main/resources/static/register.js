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
    const genderInput = document.getElementById("gender");
    const profileFileInput = document.getElementById('register-profile-file');
    const registerPreview = document.getElementById('register-profile-preview');

    // Show preview when a file is selected
    if (profileFileInput) {
        profileFileInput.addEventListener('change', function() {
            const file = profileFileInput.files[0];
            if (!file) {
                registerPreview.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'></svg>";
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                registerPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Gender toggle butonlarının davranışını ayarla (HTML'de butonlar mevcutsa)
    const genderButtons = document.querySelectorAll('.gender-toggle button');
    if (genderButtons && genderButtons.length > 0) {
        genderButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // hidden input'u güncelle
                const val = btn.getAttribute('data-value');
                genderInput.value = val;

                // active sınıfı ve aria-pressed ayarla
                genderButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            });
        });
        // Eğer önceden seçilmiş bir value varsa butonları senkronize et
        if (genderInput.value) {
            genderButtons.forEach(b => {
                if (b.getAttribute('data-value') === genderInput.value) {
                    b.classList.add('active');
                    b.setAttribute('aria-pressed', 'true');
                }
            });
        }
    }

    // Forma "submit" olayı eklendiğinde çalışacak fonksiyon
    registerForm.addEventListener("submit", function(event) {
        
        event.preventDefault(); // Sayfayı yenilemeyi engelle

        // Input'lardaki değerleri al
        const name = nameInput.value;
        const surname =surnameInput.value;
        const address= addressInput.value;
        const age = ageInput.value;
        const email = emailInput.value;
        const genderValue = genderInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!genderValue) {
            errorMessage.textContent = "Lütfen cinsiyet seçiniz.";
            return;}
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
            age:parseInt(age),
            gender: genderValue,
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
            // If user selected a file, we'll auto-login then upload the image using authenticated session
            const file = profileFileInput ? profileFileInput.files[0] : null;

            if (file && data && data.email) {
                // Auto-login to create session
                fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email: registerData.email, password: registerData.password })
                })
                .then(loginResp => {
                    if (!loginResp.ok) {
                        throw new Error('Auto-login failed after registration. Please login manually.');
                    }
                    // Now upload the file with session (credentials included)
                    const formData = new FormData();
                    formData.append('file', file);

                    return fetch('/user-dashboard/upload-profile', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });
                })
                .then(uploadResp => {
                    // Redirect to dashboard or login regardless
                    setTimeout(() => {
                        window.location.href = '/treffpunkt/login';
                    }, 1000);
                })
                .catch(err => {
                    console.error('Auto-login or upload failed:', err);
                    setTimeout(() => {
                        window.location.href = '/treffpunkt/login';
                    }, 1000);
                });
            } else {
                // No file selected — just redirect
                setTimeout(() => {
                    window.location.href = '/treffpunkt/login'; // Giriş sayfasının adı
                }, 2000);
            }
        })
        .catch(error => {
            // Hata durumunda
            console.error('Kayıt hatası:', error);
            errorMessage.textContent = error.message;
        });
    });
});