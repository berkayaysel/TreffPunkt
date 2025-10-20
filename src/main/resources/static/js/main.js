// DOM yüklendiğinde çalış
document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("register-form");

    // Eğer sayfada register formu varsa...
    if (registerForm) {
        
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm-password");
        const errorMessage = document.getElementById("password-error");

        registerForm.addEventListener("submit", (e) => {
            // Şifreler birbiriyle uyuşmuyorsa
            if (password.value !== confirmPassword.value) {
                
                // 1. Formun gönderilmesini engelle
                e.preventDefault(); 
                
                // 2. Hata mesajını göster
                errorMessage.style.display = "block";
                
            } else {
                // Şifreler uyuşuyorsa (veya daha önce hata verdiyse) hata mesajını gizle
                errorMessage.style.display = "none";
            }
        });
    }

});