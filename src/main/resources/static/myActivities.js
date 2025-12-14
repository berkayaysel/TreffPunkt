document.addEventListener('DOMContentLoaded', function() {
    const createdContainer = document.getElementById('created-events');
    const participatedContainer = document.getElementById('participated-events');
    const modal = document.getElementById('activityModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const deleteBtn = document.getElementById('deleteBtn');
    const leaveBtn = document.getElementById('leaveBtn');
    
    let currentActivityId = null;
    let isCreatedActivity = false;
    let currentActivityData = null;  // Store current activity for rating

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
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '10px';
        buttonsContainer.style.alignItems = 'center';
        
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
        detailBtn.setAttribute('data-creator-email', activity.creatorEmail || '');
        detailBtn.addEventListener('click', openModal);
        
        buttonsContainer.appendChild(detailBtn);

        // Add status label for participated activities only
        if (type === 'joined') {
            const isFinished = isActivityFinished(activity.endDate || activity.startDate);
            const statusLabel = document.createElement('span');
            statusLabel.className = `activity-status-label ${isFinished ? 'finished' : 'ongoing'}`;
            statusLabel.textContent = isFinished ? 'Finished' : 'Ongoing';
            statusLabel.setAttribute('data-finished', isFinished ? 'true' : 'false');
            buttonsContainer.appendChild(statusLabel);
        }
        
        card.appendChild(info);
        card.appendChild(buttonsContainer);
        
        return card;
    }

    function isActivityFinished(dateStr) {
        if (!dateStr) return false;
        const activityDate = new Date(dateStr);
        const now = new Date();
        return activityDate.getTime() < now.getTime();
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

        // Store activity data for rating submission
        const creatorEmail = btn.getAttribute('data-creator-email') || '';
        currentActivityData = {
            activityId: parseInt(currentActivityId),
            creatorEmail: creatorEmail,
            name: name,
            date: date
        };

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
            // Katılınan aktivite
            deleteBtn.style.display = 'none';
            leaveBtn.style.display = 'block';
            document.getElementById('participants-section').style.display = 'none';

            // Show rating button if activity is finished
            const isFinished = isActivityFinished(date);
            if (isFinished) {
                // Add rating button to modal footer if not already there
                let rateBtn = document.getElementById('rateHostBtn');
                if (!rateBtn) {
                    rateBtn = document.createElement('button');
                    rateBtn.id = 'rateHostBtn';
                    rateBtn.textContent = 'Etkinlik Sahibini Değerlendir';
                    rateBtn.style.cssText = 'background: #ffa500; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;';
                    rateBtn.addEventListener('click', () => openRatingModal(currentActivityId));
                    document.querySelector('.modal-footer').insertBefore(rateBtn, deleteBtn);
                }
                rateBtn.style.display = 'block';
            } else {
                const rateBtn = document.getElementById('rateHostBtn');
                if (rateBtn) rateBtn.style.display = 'none';
            }
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

    let pendingRemoval = null;

    function removeParticipant(event) {
        const btn = event.currentTarget;
        const userId = btn.getAttribute('data-user-id');
        const activityId = btn.getAttribute('data-activity-id');
        
        // Store the removal data and show modal
        pendingRemoval = { userId, activityId };
        document.getElementById('removalReasonModal').style.display = 'flex';
        document.getElementById('removalReasonText').value = '';
        document.getElementById('removalReasonError').style.display = 'none';
    }

    // Add these functions to global scope
    window.closeRemovalReasonModal = function() {
        document.getElementById('removalReasonModal').style.display = 'none';
        pendingRemoval = null;
    };

    window.confirmRemoval = function() {
        const reason = document.getElementById('removalReasonText').value.trim();
        
        if (!reason) {
            document.getElementById('removalReasonError').style.display = 'block';
            return;
        }
        
        if (!pendingRemoval) return;
        
        const { userId, activityId } = pendingRemoval;
        
        fetch(`/activities/${activityId}/participants/${userId}?reason=${encodeURIComponent(reason)}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if(response.ok) {
                alert("Katılımcı başarıyla çıkarıldı!");
                closeRemovalReasonModal();
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
    };

    // Rating Modal Functions
    let currentRatingActivityId = null;

    window.openRatingModal = function(activityId) {
        currentRatingActivityId = activityId;
        document.getElementById('ratingModal').style.display = 'flex';
        document.getElementById('selectedRating').value = '0';
        document.getElementById('ratingComment').value = '';
        
        // Reset stars
        document.querySelectorAll('#ratingStars i').forEach(star => {
            star.classList.remove('filled');
        });
    };

    window.closeRatingModal = function() {
        document.getElementById('ratingModal').style.display = 'none';
        currentRatingActivityId = null;
    };

    window.submitRating = function() {
        const rating = parseInt(document.getElementById('selectedRating').value);
        const comment = document.getElementById('ratingComment').value.trim();

        if (rating === 0) {
            alert('Lütfen bir puanlama seçiniz!');
            return;
        }

        if (!currentActivityData || !currentActivityData.creatorEmail) {
            console.error('[Rating] Current activity data missing:', currentActivityData);
            alert('Aktivite bilgisi alınamadı.');
            return;
        }

        const reviewData = {
            activityId: currentActivityData.activityId,
            reviewedUserEmail: currentActivityData.creatorEmail,
            rating: rating, 
            comment: comment
        };
        console.log('[Rating] Sending review data:', reviewData);

        // Send rating to backend
        fetch('/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(reviewData)
        })
        .then(response => {
            console.log('[Rating] Response status:', response.status);
            console.log('[Rating] Response ok:', response.ok);
            if (response.ok) {
                return response.json().then(data => {
                    console.log('[Rating] Success response:', data);
                    alert('Değerlendirme gönderildi. Teşekkür ederiz!');
                    closeRatingModal();
                    
                    // Hide rating button after successful submission
                    const rateBtn = document.getElementById('rateHostBtn');
                    if (rateBtn) {
                        rateBtn.style.display = 'none';
                    }
                });
            } else {
                return response.json().then(errorData => {
                    console.error('[Rating] Error response data:', errorData);
                    const errorMsg = errorData.error || errorData.message || 'Bilinmeyen hata';
                    alert('Değerlendirme gönderilemedi:\n' + errorMsg);
                }).catch(() => {
                    alert('Değerlendirme gönderilemedi. Sunucu hatası (500)');
                });
            }
        })
        .catch(error => {
            console.error('Rating error:', error);
            alert('Hata: ' + error.message);
        });
    };

    // Star rating click handler
    document.addEventListener('click', function(e) {
        if (e.target.closest('#ratingStars i')) {
            const star = e.target.closest('#ratingStars i');
            const value = star.getAttribute('data-value');
            document.getElementById('selectedRating').value = value;

            document.querySelectorAll('#ratingStars i').forEach((s, idx) => {
                if (idx < value) {
                    s.classList.add('filled');
                } else {
                    s.classList.remove('filled');
                }
            });
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        const ratingModal = document.getElementById('ratingModal');
        if (e.target === ratingModal) {
            closeRatingModal();
        }
    });
});
