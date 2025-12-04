document.addEventListener('DOMContentLoaded', function() {
    // HTML elemanlarını seçme
    const nameSpan = document.getElementById("profile-name");
    const surnameSpan = document.getElementById("profile-surname");
    const emailSpan = document.getElementById("profile-email");
    const ageSpan = document.getElementById("profile-age");
    const addressSpan = document.getElementById("profile-address");
    const logoutButton = document.getElementById("logoutButton");
    const editBtn = document.getElementById("editBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const editForm = document.getElementById("editMode");
    const viewMode = document.getElementById("viewMode");
    const errorMessage = document.getElementById("error-message");

    // Form alanları
    const editName = document.getElementById("edit-name");
    const editSurname = document.getElementById("edit-surname");
    const editEmail = document.getElementById("edit-email");
    const editAge = document.getElementById("edit-age");
    const editAddress = document.getElementById("edit-address");

    let currentUserData = {}; // Mevcut kullanıcı verilerini tutmak için

    // Ana fonksiyon: Kullanıcının giriş durumunu kontrol et ve verileri getir
    function checkLoginStatusAndFetchProfile() {
        
        fetch('/user-dashboard/profile-info', {
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
            currentUserData = data; // Mevcut verileri sakla
            // Gelen verileri DOM'a yerleştir
            nameSpan.textContent = data.name;
            surnameSpan.textContent = data.surname;
            emailSpan.textContent = data.email;
            ageSpan.textContent = data.age;
            addressSpan.textContent = data.address;
            
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
            window.location.href = '/treffpunkt/dashboard';
        });
    }

    // DÜZENLE BUTONU - Formu göster
    editBtn.addEventListener('click', function() {
        editName.value = currentUserData.name || '';
        editSurname.value = currentUserData.surname || '';
        editEmail.value = currentUserData.email || '';
        editAge.value = currentUserData.age || '';
        editAddress.value = currentUserData.address || '';
        
        viewMode.style.display = 'none';
        editForm.style.display = 'block';
    });

    // İPTAL BUTONU - Formu gizle
    cancelBtn.addEventListener('click', function() {
        editForm.style.display = 'none';
        viewMode.style.display = 'block';
        errorMessage.textContent = '';
    });

    // FORM GÖNDER - Profil güncelle
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const updateData = {
            name: editName.value,
            surname: editSurname.value,
            email: editEmail.value,
            age: parseInt(editAge.value),
            address: editAddress.value
        };

        fetch('/user-dashboard/profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Profil güncellenemedi.');
            }
            return response.json();
        })
        .then(data => {
            // Başarılı güncelleme
            errorMessage.textContent = 'Profil başarıyla güncellendi!';
            errorMessage.style.color = 'green';
            
            // Verileri yenile
            currentUserData = {
                name: data.name,
                surname: data.surname,
                email: data.email,
                age: data.age,
                address: data.address
            };
            
            // UI'yı güncelle
            checkLoginStatusAndFetchProfile();
            
            // 1.5 saniye sonra formu gizle
            setTimeout(() => {
                editForm.style.display = 'none';
                viewMode.style.display = 'block';
                errorMessage.textContent = '';
            }, 1500);
        })
        .catch(error => {
            console.error('Güncelleme hatası:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.color = 'red';
        });
    });

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
            window.location.href = '/treffpunkt/login'; // Veya hangi sayfanız varsa
        });
    });

    // Sayfa yüklendiğinde ana fonksiyonu çalıştır
    checkLoginStatusAndFetchProfile();
});