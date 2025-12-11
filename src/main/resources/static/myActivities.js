document.addEventListener('DOMContentLoaded', function() {
    const listContainer = document.getElementById('activities-list');
    const modal = document.getElementById('activityModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const deleteBtn = document.getElementById('deleteBtn');
    const leaveBtn = document.getElementById('leaveBtn');
    
    let currentActivityId = null;
    let isCreatedActivity = false; // Created mi joined mi olduğunu tutacağız

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
            listContainer.innerHTML = `<p style="text-align:center; color:red;">${error.message}</p>`;
        });
    }

    function renderActivities(created, joined) {
        listContainer.innerHTML = '';

        const createSection = document.createElement('div');
        createSection.classList.add('section');
        const joinedSection = document.createElement('div');
        joinedSection.classList.add('section');

        const createdTitle = document.createElement('h3');
        createdTitle.textContent = 'Oluşturduğum Aktiviteler';
        createSection.appendChild(createdTitle);

        if (!created || created.length === 0) {
            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.textContent = 'Henüz oluşturduğunuz bir aktivite yok.';
            createSection.appendChild(p);
        } else {
            created.forEach(activity => {
                const card = document.createElement('div');
                card.classList.add('activity-card');
                card.innerHTML = `
                    <div class="card-info">
                        <h4>${activity.name}</h4>
                        <p>${activity.startDate} | ${activity.location}</p>
                        <p>Kategori: ${activity.category || 'Diğer'}</p>
                    </div>
                    <button class="btn-detail" 
                        data-id="${activity.activityId}" 
                        data-type="created"
                        data-name="${activity.name}"
                        data-category="${activity.category || ''}"
                        data-loc="${activity.location}"
                        data-date="${activity.startDate}"
                        data-time="${activity.startTime}"
                        data-desc="${activity.description || ''}"
                        data-capacity="${activity.capacity || ''}"
                        data-number="${activity.numberOfParticipants || ''}">
                        Detay
                    </button>
                `;
                createSection.appendChild(card);
            });
        }

        const joinedTitle = document.createElement('h3');
        joinedTitle.textContent = 'Katıldığım Aktiviteler';
        joinedSection.appendChild(joinedTitle);

        if (!joined || joined.length === 0) {
            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.textContent = 'Henüz katıldığınız bir aktivite yok.';
            joinedSection.appendChild(p);
        } else {
            joined.forEach(activity => {
                const card = document.createElement('div');
                card.classList.add('activity-card');
                card.innerHTML = `
                    <div class="card-info">
                        <h4>${activity.name}</h4>
                        <p>${activity.startDate} | ${activity.location}</p>
                        <p>Kategori: ${activity.category || 'Diğer'}</p>
                    </div>
                    <button class="btn-detail" 
                        data-id="${activity.activityId}" 
                        data-type="joined"
                        data-name="${activity.name}"
                        data-category="${activity.category || ''}"
                        data-loc="${activity.location}"
                        data-date="${activity.startDate}"
                        data-time="${activity.startTime}"
                        data-desc="${activity.description || ''}"
                        data-capacity="${activity.capacity || 0}"
                        data-number="${activity.numberOfParticipants || 0}">
                        Detay
                    </button>
                `;
                joinedSection.appendChild(card);
            });
        }

        listContainer.appendChild(createSection);
        listContainer.appendChild(joinedSection);

        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', openModal);
        });
    }

    function openModal(event) {
        const btn = event.target;
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
            // Katılımcı bölümünü gizle
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