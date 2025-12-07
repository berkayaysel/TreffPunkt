// Sayfa tamamen yüklendiğinde çalışır
window.onload = function() {
    fetchActivities();
    setupDetailBackButton();
    setupFilterHandlers();
};

let allActivities = [];

function setupFilterHandlers() {
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-remaining').checked = false;
        document.getElementById('filter-date').value = 'asc';
        renderActivities(allActivities);
    });
}

function applyFilters() {
    const cat = document.getElementById('filter-category').value;
    const onlyRemaining = document.getElementById('filter-remaining').checked;
    const dateOrder = document.getElementById('filter-date').value || 'asc';

    // Build query string and request server-side filtered results
    const params = new URLSearchParams();
    if (cat && cat !== '') params.set('category', cat);
    if (onlyRemaining) params.set('available', 'true');
    if (dateOrder) params.set('dateOrder', dateOrder);

    fetch('/activities?' + params.toString())
        .then(r => {
            if (!r.ok) throw new Error('Filtrelenmiş aktiviteler alınamadı');
            return r.json();
        })
        .then(list => {
            allActivities = list || [];
            renderActivities(allActivities);
        })
        .catch(err => {
            console.error('Filter error', err);
            alert('Filtre uygulanırken hata oluştu');
        });
}

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
            // cache full list for filtering
            allActivities = activities || [];
            const container = document.getElementById('activity-container');
            const emptyMsg = document.getElementById('no-activity-msg');

            // Ensure container is cleared before rendering to avoid duplicate entries
            if (container) container.innerHTML = '';

            if (allActivities && allActivities.length > 0) {
                if(emptyMsg) emptyMsg.style.display = 'none';
                renderActivities(allActivities);
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

function renderActivities(list) {
    const container = document.getElementById('activity-container');
    const emptyMsg = document.getElementById('no-activity-msg');
    if (container) container.innerHTML = '';
    if (!list || list.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg && (emptyMsg.style.display = 'none');

    list.forEach(activity => {
        const aid = activity.activityId || activity.id;
        const cardHTML = `
            <div class="activity-card">
                <div class="activity-title">${activity.name || 'Başlıksız Aktivite'}</div>
                <div class="activity-info">Kategori: ${escapeHtml(activity.category || 'Diğer')}</div>
                <div class="activity-info">📅 ${formatDateOnly(activity.startDate)}</div>
                <div class="activity-info">⏰ ${formatTime(activity.startTime)}</div>
                <div class="activity-info">📍 ${activity.location || 'Konum yok'}</div>
                <div class="activity-info">👤 ${escapeHtml((activity.creatorName ? activity.creatorName : '') + ' ' + (activity.creatorSurname ? activity.creatorSurname : ''))}</div>
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
                        data-creator-email="${escapeHtml(activity.creatorEmail || '')}"
                        data-creator-name="${escapeHtml(activity.creatorName || '')}"
                        data-creator-surname="${escapeHtml(activity.creatorSurname || '')}"
                        data-category="${escapeHtml(activity.category || '')}">
                    Detay
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });

    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', openDetailSection);
    });
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
}

function formatDateOnly(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

function formatTime(timeString) {
    if (!timeString) return "";
    // timeString may be 'HH:mm:ss', 'HH:mm', or an ISO datetime
    if (timeString.includes('T')) {
        const d = new Date(timeString);
        return d.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    }
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return parts[0].padStart(2,'0') + ':' + parts[1].padStart(2,'0');
    }
    return timeString;
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
    const creatorEmail = btn.getAttribute('data-creator-email') || '';
    const creatorName = btn.getAttribute('data-creator-name') || '';
    const creatorSurname = btn.getAttribute('data-creator-surname') || '';
    const category = btn.getAttribute('data-category') || '';

    document.getElementById('detail-title').textContent = name || 'Aktivite Detay';
    document.getElementById('detail-location').textContent = loc;
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-time').textContent = time;
    document.getElementById('detail-description').textContent = desc || '(Yok)';
    document.getElementById('detail-creator').textContent = (creatorName || creatorEmail || '') + (creatorSurname ? (' ' + creatorSurname) : '');
    document.getElementById('detail-capacity').textContent = capacity;
    document.getElementById('detail-number').textContent = number;
    document.getElementById('detail-category').textContent = category || '(Belirtilmemiş)';

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
    // hide filter sidebar when showing detail
    const sidebar = document.getElementById('filter-sidebar');
    if (sidebar) sidebar.style.display = 'none';
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
            const sidebar = document.getElementById('filter-sidebar');
            if (sidebar) sidebar.style.display = 'block';
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