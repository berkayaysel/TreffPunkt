document.addEventListener('DOMContentLoaded', function() {
    const createdContainer = document.getElementById('created-events');
    const participatedContainer = document.getElementById('participated-events');
    const modal = document.getElementById('activityModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const deleteBtn = document.getElementById('deleteBtn');
    const leaveBtn = document.getElementById('leaveBtn');
    
    let currentActivityId = null;
    let isCreatedActivity = false;

    function fetchActivities() {
        fetch('/activities/my-activities', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Oturum kapalı. Lütfen giriş yapın.");
            }
            if (!response.ok) {
                throw new Error("Aktiviteler alınamadı.");
            }
            return response.json();
        })
        .then(data => {
            renderActivities(data.created || [], data.joined || []);
        })
        .catch(error => {
            console.error('Hata:', error);
            createdContainer.innerHTML = `<p style="text-align:center; color:red;">${error.message}</p>`;
        });
    }

    function renderActivities(created, joined) {
        // Render Created Events
        if (!created || created.length === 0) {
            createdContainer.innerHTML = '<p class="empty-state">Henüz hiç aktivite oluşturmadınız.</p>';
        } else {
            createdContainer.innerHTML = '';
            created.forEach(activity => {
                const card = createEventCard(activity, 'created');
                createdContainer.appendChild(card);
            });
        }

        // Render Participated Events
        if (!joined || joined.length === 0) {
            participatedContainer.innerHTML = '<p class="empty-state">You haven\'t participated in any activities yet.</p>';
        } else {
            participatedContainer.innerHTML = '';
            joined.forEach(activity => {
                const card = createEventCard(activity, 'joined');
                participatedContainer.appendChild(card);
            });
        }
    }

    function createEventCard(activity, type) {
        const card = document.createElement('div');
        card.className = 'event-item';
        
        const info = document.createElement('div');
        info.className = 'event-item-info';
        
        const name = document.createElement('h4');
        name.className = 'event-item-name';
        name.textContent = activity.name;
        
        const meta = document.createElement('p');
        meta.className = 'event-item-meta';
        meta.innerHTML = `
            <span>${formatDate(activity.startDate)}</span>
            <span>${activity.location}</span>
            <span>${activity.category || 'Diğer'}</span>
        `;
        
        info.appendChild(name);
        info.appendChild(meta);
        
        const detailBtn = document.createElement('button');
        detailBtn.className = 'details-btn';
        detailBtn.textContent = 'Details';
        detailBtn.setAttribute('data-id', activity.activityId);
        detailBtn.setAttribute('data-type', type);
        detailBtn.setAttribute('data-name', activity.name);
        detailBtn.setAttribute('data-category', activity.category || '');
        detailBtn.setAttribute('data-loc', activity.location);
        detailBtn.setAttribute('data-date', activity.startDate);
        detailBtn.setAttribute('data-time', activity.startTime);
        detailBtn.setAttribute('data-desc', activity.description || '');
        detailBtn.setAttribute('data-capacity', activity.capacity || '0');
        detailBtn.setAttribute('data-number', activity.numberOfParticipants || '0');
        detailBtn.addEventListener('click', openModal);
        
        card.appendChild(info);
        card.appendChild(detailBtn);
        
        return card;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    }

    function openModal(event) {
        const btn = event.currentTarget;
        const name = btn.getAttribute('data-name');
        const category = btn.getAttribute('data-category') || '';
        const loc = btn.getAttribute('data-loc');
        const date = btn.getAttribute('data-date');
        const time = btn.getAttribute('data-time');
        const desc = btn.getAttribute('data-desc') || '';
        const capacity = btn.getAttribute('data-capacity') || '0';
        const number = btn.getAttribute('data-number') || '0';
        currentActivityId = btn.getAttribute('data-id');
        isCreatedActivity = btn.getAttribute('data-type') === 'created';

        document.getElementById('modal-title').textContent = name;
        document.getElementById('modal-location').textContent = loc;
        document.getElementById('modal-date').textContent = date;
        document.getElementById('modal-time').textContent = time;
        document.getElementById('modal-category').textContent = category || '(Belirtilmemiş)';
        document.getElementById('modal-description').textContent = desc || '(Yok)';
        document.getElementById('modal-capacity').textContent = capacity;
        document.getElementById('modal-number').textContent = number;

        // Oluşturduğum aktivite ise Delete butonunu göster ve katılımcıları getir
        if (isCreatedActivity) {
            deleteBtn.style.display = 'block';
            leaveBtn.style.display = 'none';
            fetchParticipants(currentActivityId);
        } else {
            deleteBtn.style.display = 'none';
            leaveBtn.style.display = 'block';
            document.getElementById('participants-section').style.display = 'none';
        }

        modal.style.display = 'flex';
    }

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentActivityId = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentActivityId = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Delete Activity (Oluşturduğum aktiviteyi sil)
    deleteBtn.addEventListener('click', function() {
        if(!currentActivityId) return;

        if(confirm("Bu aktiviteyi silmek istediğinize emin misiniz?")) {
            fetch(`/user-dashboard/activities/${currentActivityId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
                if(response.ok) {
                    alert("Aktivite silindi!");
                    modal.style.display = 'none';
                    fetchActivities();
                } else {
                    alert("Silme işlemi başarısız oldu.");
                }
            })
            .catch(error => console.error("Silme hatası:", error));
        }
    });

    // Leave Activity (Aktiviteden ayrıl)
    leaveBtn.addEventListener('click', function() {
        if(!currentActivityId) return;

        if(confirm("Bu aktiviteden ayrılmak istediğinize emin misiniz?")) {
            fetch(`/activities/${currentActivityId}/leave`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
                if(response.ok) {
                    alert("Aktiviteden başarıyla ayrıldınız!");
                    modal.style.display = 'none';
                    fetchActivities();
                } else {
                    alert("Ayrılma işlemi başarısız oldu.");
                }
            })
            .catch(error => {
                console.error("Ayrılma hatası:", error);
                alert("Hata: " + error.message);
            });
        }
    });

    fetchActivities();

    function fetchParticipants(activityId) {
        fetch(`/activities/${activityId}/participants`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Katılımcılar alınamadı.");
            }
            return response.json();
        })
        .then(participants => {
            renderParticipants(participants, activityId);
        })
        .catch(error => {
            console.error('Katılımcıları getirme hatası:', error);
        });
    }

    function renderParticipants(participants, activityId) {
        const participantsSection = document.getElementById('participants-section');
        const participantsList = document.getElementById('participants-list');
        
        participantsList.innerHTML = '';
        
        if (!participants || participants.length === 0) {
            participantsList.innerHTML = '<p style="text-align:center; color:#666;">Henüz katılımcı yok.</p>';
            participantsSection.style.display = 'block';
            return;
        }
        
        participants.forEach(participant => {
            const participantCard = document.createElement('div');
            participantCard.classList.add('participant-card');
            
            const profileImg = participant.profileImage 
                ? `/uploads/profile-images/${participant.profileImage}` 
                : '/uploads/profile-images/default-avatar.png';
            
            participantCard.innerHTML = `
                <div class="participant-info">
                    <div class="participant-avatar-wrapper">
                        <img src="${profileImg}" alt="Profile" class="participant-avatar">
                    </div>
                    <div class="participant-details">
                        <span class="participant-name">${participant.name || ''} ${participant.surname || ''}</span>
                        <span class="participant-email">${participant.email || ''}</span>
                    </div>
                </div>
                <button class="btn-remove-participant" data-user-id="${participant.userId}" data-activity-id="${activityId}">
                    <i class="fas fa-times"></i> Çıkar
                </button>
            `;
            
            participantsList.appendChild(participantCard);
        });
        
        // Çıkar butonlarına event listener ekle
        document.querySelectorAll('.btn-remove-participant').forEach(btn => {
            btn.addEventListener('click', removeParticipant);
        });
        
        participantsSection.style.display = 'block';
    }

    function removeParticipant(event) {
        const btn = event.currentTarget;
        const userId = btn.getAttribute('data-user-id');
        const activityId = btn.getAttribute('data-activity-id');
        
        if (!confirm("Bu katılımcıyı aktiviteden çıkarmak istediğinize emin misiniz?")) {
            return;
        }
        
        fetch(`/activities/${activityId}/participants/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if(response.ok) {
                alert("Katılımcı başarıyla çıkarıldı!");
                // Katılımcıları yeniden yükle
                fetchParticipants(activityId);
                // Aktiviteleri de güncelle (katılımcı sayısı değişti)
                fetchActivities();
            } else {
                alert("Katılımcı çıkarma işlemi başarısız oldu.");
            }
        })
        .catch(error => {
            console.error("Katılımcı çıkarma hatası:", error);
            alert("Hata: " + error.message);
        });
    }
});