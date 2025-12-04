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
                    const cardHTML = `
                        <div class="activity-card">
                            <div class="activity-title">${activity.name || 'Başlıksız Aktivite'}</div>
                            <div class="activity-info">📅 ${formatDate(activity.startDate)}</div>
                            <div class="activity-info">📍 ${activity.location || 'Konum yok'}</div>
                            <div class="activity-info">📝 ${activity.description || 'Açıklama yok'}</div>
                            <div class="activity-info">👥 ${activity.numberOfParticipants || 0} katılımcı</div>
                            <a href="/treffpunkt/activity-detail?id=${activity.id}" class="detail-btn">Detay</a>
                        </div>
                    `;
                    container.innerHTML += cardHTML;
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