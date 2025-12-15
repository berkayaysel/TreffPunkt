document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const publicEmail = urlParams.get('email');
    // HTML elemanlarını seçme
    const nameSpan = document.getElementById("profile-name");
    const surnameSpan = document.getElementById("profile-surname");
    const emailSpan = document.getElementById("profile-email");
    const birthDateSpan = document.getElementById("profile-birthDate");
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
    const editBirthDate = document.getElementById("edit-birthDate");
    const editAddress = document.getElementById("edit-address");

    let currentUserData = {}; // Mevcut kullanıcı verilerini tutmak için
    const profileImg = document.getElementById('profile-img');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const profileFileInput = document.getElementById('profileFile');

    // Ana fonksiyon: Kullanıcının giriş durumunu kontrol et ve verileri getir
    function populateProfile(data, isPublic=false) {
        currentUserData = data;
        nameSpan.textContent = data.name || '';
        surnameSpan.textContent = data.surname || '';
        emailSpan.textContent = data.email || '';
        birthDateSpan.textContent = data.birthDate || '';
        addressSpan.textContent = data.address || '';

        const usernameSpan = document.getElementById('profile-username');
        if (usernameSpan && data.email) {
            usernameSpan.textContent = data.email.split('@')[0];
        }

        if (data.profileImage) {
            const sep = data.profileImage.includes('?') ? '&' : '?';
            profileImg.src = data.profileImage + sep + 't=' + new Date().getTime();
        } else {
            profileImg.src = '/uploads/profile-images/default-avatar.png';
        }

        // Stats and counts
        const createdSpan = document.getElementById('created-events-count');
        const participatedSpan = document.getElementById('participated-events-count');
        if (createdSpan && data.createdCount !== undefined) createdSpan.textContent = data.createdCount;
        if (participatedSpan && data.participatedCount !== undefined) participatedSpan.textContent = data.participatedCount;

        // Rating info
        const ratingSpan = document.getElementById('profile-rating');
        const reviewCountSpan = document.getElementById('profile-review-count');
        if (ratingSpan && data.averageRating !== undefined && data.averageRating !== null) {
            ratingSpan.textContent = parseFloat(data.averageRating).toFixed(1);
        }
        if (reviewCountSpan && data.reviewCount !== undefined) {
            reviewCountSpan.textContent = data.reviewCount;
        }

        if (!isPublic) {
            fetchEventStats();
        }

        nameSpan.classList.remove('loading-placeholder');
        surnameSpan.classList.remove('loading-placeholder');
        emailSpan.classList.remove('loading-placeholder');
        birthDateSpan.classList.remove('loading-placeholder');
        addressSpan.classList.remove('loading-placeholder');
    }

    function checkLoginStatusAndFetchProfile() {
        if (publicEmail) {
            // Public view: read-only fetch by email
            disableEditingUI();
            hideSensitiveFieldsForPublic();
            fetch('/user-dashboard/public-profile?email=' + encodeURIComponent(publicEmail))
                .then(r => {
                    if (!r.ok) throw new Error('Profil bulunamadı');
                    return r.json();
                })
                .then(data => populateProfile(data, true))
                .catch(err => {
                    console.error(err);
                    alert('Profil yüklenemedi');
                    window.location.href = '/treffpunkt/dashboard';
                });
            return;
        }

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
            populateProfile(data, false);
        })
        .catch(error => {
            
            console.error('Profil yüklenirken hata oluştu:', error.message);
            
            window.location.href = '/treffpunkt/dashboard';
        });
    }

    function disableEditingUI() {
        const editables = [editBtn, cancelBtn, editForm, logoutButton, changeImageBtn, profileFileInput];
        editables.forEach(el => { if (el) el.style.display = 'none'; });
        const backBtn = document.querySelector('.profile-back-button');
        if (backBtn) backBtn.href = '/treffpunkt/dashboard';
    }

    function hideSensitiveFieldsForPublic() {
        const items = [addressSpan, emailSpan, birthDateSpan]
            .map(span => span ? span.closest('.profile-info-item') : null)
            .filter(Boolean);
        items.forEach(item => item.style.display = 'none');
    }

    // DÜZENLE BUTONU - Formu göster
    editBtn.addEventListener('click', function() {
        editName.value = currentUserData.name || '';
        editSurname.value = currentUserData.surname || '';
        editEmail.value = currentUserData.email || '';
        editBirthDate.value = currentUserData.birthDate || '';
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
            birthDate: editBirthDate.value,
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
                birthDate: data.birthDate,
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

    // Profil resmi değiştirme akışı
    changeImageBtn.addEventListener('click', function() {
        profileFileInput.click();
    });

    profileFileInput.addEventListener('change', function() {
        const file = profileFileInput.files[0];
        if (!file) return;

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);

        fetch('/user-dashboard/upload-profile', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Resim yükleme başarısız.');
            return response.text();
        })
        .then(text => {
            let url = (text || '').trim();

            // If server returned JSON (e.g. {"url": "/uploads/.."}) try to parse
            if (url.startsWith('{') || url.startsWith('[')) {
                try {
                    const parsed = JSON.parse(url);
                    if (parsed.url) url = parsed.url;
                    else if (parsed.publicUrl) url = parsed.publicUrl;
                } catch (e) {
                    // ignore parse error
                }
            }

            // Strip surrounding quotes if present
            if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
                url = url.slice(1, -1);
            }

            if (!url) throw new Error('Sunucudan geçerli bir resim URLsi dönmedi.');

            const sep = url.includes('?') ? '&' : '?';
            profileImg.src = url + sep + 't=' + new Date().getTime();
            // Update local cached profile info
            currentUserData.profileImage = url;
            // As a fallback, reload the page once to ensure all UI reflects the new image
            setTimeout(() => {
                try { window.location.reload(); } catch (e) { /* ignore */ }
            }, 600);
        })
        .catch(err => {
            console.error('Resim yükleme hatası:', err);
            alert('Resim yüklenirken hata oluştu.');
        });
    });
    
    // Event sayılarını getir
    function fetchEventStats() {
        fetch('/activities/my-activities', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(data => {
            if (data) {
                const createdCount = (data.created || []).length;
                const joinedCount = (data.joined || []).length;
                
                const createdSpan = document.getElementById('created-events-count');
                const participatedSpan = document.getElementById('participated-events-count');
                
                if (createdSpan) createdSpan.textContent = createdCount;
                if (participatedSpan) participatedSpan.textContent = joinedCount;
            }
        })
        .catch(error => {
            console.error('Event sayıları alınamadı:', error);
        });
    }

    function fetchUserRating() {
        fetch('/reviews/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(data => {
            if (data) {
                // Set average rating
                if (data.averageRating) {
                    const ratingSpan = document.getElementById('profile-rating');
                    if (ratingSpan) {
                        // Format: 4.6 (round to 1 decimal place)
                        const rating = parseFloat(data.averageRating).toFixed(1);
                        ratingSpan.textContent = rating;
                    }
                }
                
                // Set review count
                if (data.reviewCount !== undefined) {
                    const countSpan = document.getElementById('profile-review-count');
                    if (countSpan) {
                        countSpan.textContent = data.reviewCount;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Rating alınamadı:', error);
        });
    }
    
    // Reviews Modal Functions
    window.closeReviewsModal = function() {
        document.getElementById('reviewsModal').style.display = 'none';
    };

    function openReviewsModal() {
        fetch('/reviews/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Reviews alınamadı');
            return response.json();
        })
        .then(data => {
            const reviewsList = document.getElementById('reviewsList');
            reviewsList.innerHTML = '';

            if (!data.reviews || data.reviews.length === 0) {
                reviewsList.innerHTML = '<p style="text-align: center; color: #999;">Henüz hiç yorum yapılmamış.</p>';
                document.getElementById('reviewsModal').style.display = 'flex';
                return;
            }

            data.reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card';
                
                // Generate stars
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    starsHtml += `<i class="fas fa-star" style="color: ${i <= review.rating ? '#ffa500' : '#ddd'}; font-size: 14px;"></i>`;
                }

                const formattedDate = new Date(review.createdAt).toLocaleDateString('tr-TR');
                
                reviewCard.innerHTML = `
                    <div class="review-header">
                        <div class="reviewer-info">
                            <img src="${review.reviewerProfileImage || '/uploads/profile-images/default-avatar.png'}" 
                                 alt="Reviewer" class="reviewer-avatar">
                            <div class="reviewer-details">
                                <div class="reviewer-name">${review.reviewerName || ''} ${review.reviewerSurname || ''}</div>
                                <div class="review-date">${formattedDate}</div>
                            </div>
                        </div>
                        <div class="review-rating">${starsHtml}</div>
                    </div>
                    <div class="review-comment">${review.comment || '(Yorum yok)'}</div>
                `;
                
                reviewsList.appendChild(reviewCard);
            });

            document.getElementById('reviewsModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Reviews modal hatası:', error);
            alert('Yorumlar yüklenemedi.');
        });
    }

    // Rating count box'a click handler
    const reviewCountBox = document.getElementById('reviewCountBox');
    if (reviewCountBox) {
        reviewCountBox.addEventListener('click', openReviewsModal);
    }

    // Modal dışında tıklanınca kapat
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('reviewsModal');
        if (e.target === modal) {
            closeReviewsModal();
        }
    });

    // Sayfa yüklendiğinde profil bilgilerini getir
    checkLoginStatusAndFetchProfile();
    
    // Profil yüklendikten sonra rating'i de çek
    setTimeout(() => {
        fetchUserRating();
    }, 500);
});