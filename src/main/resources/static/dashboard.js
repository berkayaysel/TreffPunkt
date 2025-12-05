// Sayfa tamamen yüklendiğinde çalışır
window.onload = function() {
    fetchActivities();
};

function fetchActivities() {
    // Backend adresi (Controller'a göre güncellemeyi unutma)
    const url = '/activities/all';

    fetch(url)
        .then(response => {
            // Yükleniyor yazısını gizle
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

            // Eğer gelen liste doluysa
            if (activities && activities.length > 0) {
                if(emptyMsg) emptyMsg.style.display = 'none';

                activities.forEach(activity => {
                    // Backend'den gelen veri isimlerine dikkat (title, date vs.)
                    // activityId alanı farklı isimlerde gelebilir; öncelikle activity.activityId deneyelim
                    const aid = activity.activityId || activity.id || activity.activityId;
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
                                    data-number="${activity.numberOfParticipants || ''}">
                                Detay
                            </button>
                        </div>
                    `;
                    container.innerHTML += cardHTML;
                });

                // Detay butonlarına tıklama olayını ekle
                document.querySelectorAll('.detail-btn').forEach(btn => {
                    btn.addEventListener('click', openDetailModal);
                });
            } else {
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

// helper: escape HTML for data attributes
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// MODAL: detay açma/kapatma ve katılma
const detailModal = document.getElementById('activityDetailModal');
const detailClose = document.getElementById('detailClose');
const joinBtn = document.getElementById('joinBtn');

function openDetailModal(e) {
    const btn = e.currentTarget;
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name') || '';
    const loc = btn.getAttribute('data-loc') || '';
    const date = btn.getAttribute('data-date') || '';
    const time = btn.getAttribute('data-time') || '';
    const desc = btn.getAttribute('data-desc') || '';
    const capacity = btn.getAttribute('data-capacity') || '-';
    const number = btn.getAttribute('data-number') || '-';

    document.getElementById('detail-title').textContent = name || 'Aktivite Detay';
    document.getElementById('detail-location').textContent = loc;
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-time').textContent = time;
    document.getElementById('detail-description').textContent = desc || '(Yok)';
    document.getElementById('detail-capacity').textContent = capacity;
    document.getElementById('detail-number').textContent = number;

    // store current id on join button
    if (joinBtn) joinBtn.setAttribute('data-current-id', id);

    if (detailModal) detailModal.style.display = 'flex';
}

if (detailClose) detailClose.addEventListener('click', () => { if (detailModal) detailModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === detailModal) detailModal.style.display = 'none'; });

// Join işlemi: profile-info'dan userId alıp aktiviteye katılma
joinBtn && joinBtn.addEventListener('click', function() {
    const activityId = this.getAttribute('data-current-id');
    if (!activityId) {
        alert('Aktivite ID bulunamadı.');
        return;
    }

    // Backend principal-based authentication kullanıyor, 
    // bu nedenle boş body gönderin, backend session'dan user bilgisini çıkaracak
    fetch(`/activities/${activityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
    })
    .then(r => {
        if (r.ok) {
            alert('Aktiviteye katılma başarılı!');
            if (detailModal) detailModal.style.display = 'none';
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