// Sayfa tamamen yüklendiğinde çalışır
window.onload = function() {
    fetchActivities();
    setupDetailBackButton();
};

function fetchActivities() {
    const url = '/activities/all';

    fetch(url)
        .then(response => {
            const loadingMsg = document.getElementById('loading-msg');
            if (loadingMsg) loadingMsg.style.display = 'none';

            if (!response.ok) {
                throw new Error('Veri çekilemedi veya Backend kapalı');
            }
            return response.json();
        })
        .then(activities => {
            const container = document.getElementById('activity-container');
            const emptyMsg = document.getElementById('no-activity-msg');

            // Ensure container is cleared before rendering to avoid duplicate entries
            if (container) container.innerHTML = '';

            if (activities && activities.length > 0) {
                if(emptyMsg) emptyMsg.style.display = 'none';

                activities.forEach(activity => {
                    const aid = activity.activityId || activity.id;
                    const cardHTML = `
                        <div class="activity-card">
                            <div class="activity-title">${activity.name || 'Başlıksız Aktivite'}</div>
                            <div class="activity-info">📅 ${formatDate(activity.startDate)}</div>
                            <div class="activity-info">📍 ${activity.location || 'Konum yok'}</div>
                            <div class="activity-info">📝 ${activity.description || 'Açıklama yok'}</div>
                            <div class="activity-info">👥 ${activity.numberOfParticipants || 0} katılımcı</div>
                            <button class="detail-btn" 
                                    data-id="${aid}"
                                    data-name="${escapeHtml(activity.name)}"
                                    data-loc="${escapeHtml(activity.location)}"
                                    data-date="${activity.startDate || ''}"
                                    data-time="${activity.startTime || ''}"
                                    data-desc="${escapeHtml(activity.description || '')}"
                                    data-capacity="${activity.capacity || ''}"
                                    data-number="${activity.numberOfParticipants || ''}"
                                    data-creator="${escapeHtml(activity.creatorEmail || '')}">
                                Detay
                            </button>
                        </div>
                    `;
                    container.innerHTML += cardHTML;
                });

                document.querySelectorAll('.detail-btn').forEach(btn => {
                    btn.addEventListener('click', openDetailSection);
                });
            } else {
                // when no activities, ensure container is empty and show message
                if (container) container.innerHTML = '';
                if(emptyMsg) emptyMsg.style.display = 'block';
            }
        })
        .catch(error => {
            console.log("Hata:", error);
            const loadingMsg = document.getElementById('loading-msg');
            if (loadingMsg) loadingMsg.style.display = 'none';
            
            const emptyMsg = document.getElementById('no-activity-msg');
            if(emptyMsg) emptyMsg.style.display = 'block';
        });
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// DETAY BÖLÜMÜ GÖSTERME
const detailSection = document.getElementById('detail-section');
const activityContainer = document.getElementById('activity-container');
const joinBtn = document.getElementById('joinBtn');

function openDetailSection(e) {
    const btn = e.currentTarget;
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name') || '';
    const loc = btn.getAttribute('data-loc') || '';
    const date = btn.getAttribute('data-date') || '';
    const time = btn.getAttribute('data-time') || '';
    const desc = btn.getAttribute('data-desc') || '';
    const capacity = btn.getAttribute('data-capacity') || '-';
    const number = btn.getAttribute('data-number') || '-';
    const creatorEmail = btn.getAttribute('data-creator') || '';

    document.getElementById('detail-title').textContent = name || 'Aktivite Detay';
    document.getElementById('detail-location').textContent = loc;
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-time').textContent = time;
    document.getElementById('detail-description').textContent = desc || '(Yok)';
    document.getElementById('detail-capacity').textContent = capacity;
    document.getElementById('detail-number').textContent = number;

    if (joinBtn) {
        joinBtn.setAttribute('data-current-id', id);
        
        // Kullanıcının email'ini principal'dan alalım
        fetch('/user-dashboard/profile-info', { credentials: 'include' })
            .then(r => r.json())
            .then(profile => {
                // Eğer bu aktivite kendi aktivitesiyse, Join butonunu gizle
                if (creatorEmail === profile.email) {
                    joinBtn.style.display = 'none';
                } else {
                    joinBtn.style.display = 'block';
                }
            })
            .catch(err => {
                console.error('Email kontrol hatası:', err);
                joinBtn.style.display = 'block'; // Hata durumunda göster
            });
    }

    // Aktivite listesini gizle, detayı göster
    activityContainer.style.display = 'none';
    detailSection.style.display = 'block';
    
    // Sayfanın üstüne git
    window.scrollTo(0, 0);
}

function setupDetailBackButton() {
    const backBtn = document.getElementById('backFromDetail');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            detailSection.style.display = 'none';
            activityContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    }
}

// Join işlemi
joinBtn && joinBtn.addEventListener('click', function() {
    const activityId = this.getAttribute('data-current-id');
    if (!activityId) {
        alert('Aktivite ID bulunamadı.');
        return;
    }

    fetch(`/activities/${activityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
    })
    .then(r => {
        if (r.ok) {
            alert('Aktiviteye katılma başarılı!');
            detailSection.style.display = 'none';
            activityContainer.style.display = 'block';
            fetchActivities();
        } else if (r.status === 401) {
            alert('Yetkisiz erişim. Lütfen giriş yapın.');
        } else if (r.status === 409) {
            r.text().then(t => alert('Katılım başarısız: ' + t));
        } else {
            r.text().then(t => alert('Katılma isteği başarısız: ' + t));
        }
    })
    .catch(err => {
        console.error('Join hatası', err);
        alert('Katılma isteği sırasında hata oluştu. Konsolu kontrol edin.');
    });
});