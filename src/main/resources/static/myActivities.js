document.addEventListener('DOMContentLoaded', function() {
    const listContainer = document.getElementById('activities-list');
    const modal = document.getElementById('activityModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const deleteBtn = document.getElementById('deleteBtn');
    
    // Silme işlemi için seçili aktivitenin ID'sini tutacağız
    let currentActivityId = null;

    // --- ANA FONKSİYON: Doğrudan Aktiviteleri İste ---
    function fetchActivities() {
        // URL'de artık ID yok! Backend kim olduğumuzu Cookie'den biliyor.
        // Backend controller: ActivityController.getMyActivities -> GET /activities/my-activities
        fetch('/activities/my-activities', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Oturum bilgisini (Cookie) gönder
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
            // Beklenen cevap: { created: [...], joined: [...] }
            renderActivities(data.created || [], data.joined || []);
        })
        .catch(error => {
            console.error('Hata:', error);
            listContainer.innerHTML = `<p style="text-align:center; color:red;">${error.message}</p>`;
            // İstersen burada login sayfasına yönlendirme yapabilirsin:
            // if(error.message.includes("Oturum kapalı")) window.location.href = '/login.html';
        });
    }

    // Aktiviteleri Ekrana Basan Fonksiyon (Burası aynı kaldı)
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
                    </div>
                    <button class="btn-detail" 
                        data-id="${activity.activityId}" 
                        data-name="${activity.name}"
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
                    </div>
                    <button class="btn-detail" 
                        data-id="${activity.activityId}" 
                        data-name="${activity.name}"
                        data-loc="${activity.location}"
                        data-date="${activity.startDate}"
                        data-time="${activity.startTime}"
                        data-desc="${activity.description || ''}"
                        data-capacity="${activity.capacity || ''}"
                        data-number="${activity.numberOfParticipants || ''}">
                        Detay
                    </button>
                `;
                joinedSection.appendChild(card);
            });
        }

        listContainer.appendChild(createSection);
        listContainer.appendChild(joinedSection);

        // Butonlara tıklama olayını ekle
        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', openModal);
        });
    }

    // Modalı Aç
    function openModal(event) {
        const btn = event.target;
        const name = btn.getAttribute('data-name');
        const loc = btn.getAttribute('data-loc');
        const date = btn.getAttribute('data-date');
        const time = btn.getAttribute('data-time');
        const desc = btn.getAttribute('data-desc') || '';
        const capacity = btn.getAttribute('data-capacity') || '-';
        const number = btn.getAttribute('data-number') || '-';
        currentActivityId = btn.getAttribute('data-id');

        document.getElementById('modal-title').textContent = name;
        document.getElementById('modal-location').textContent = loc;
        document.getElementById('modal-date').textContent = date;
        document.getElementById('modal-time').textContent = time;
        document.getElementById('modal-description').textContent = desc || '(Yok)';
        document.getElementById('modal-capacity').textContent = capacity;
        document.getElementById('modal-number').textContent = number;

        modal.style.display = 'flex';
    }

    // Modalı Kapat
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentActivityId = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Silme İşlemi (Aktivite ID'si ile silme yapar, User ID gerekmez)
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
                    fetchActivities(); // Listeyi yenile
                } else {
                    alert("Silme işlemi başarısız oldu.");
                }
            })
            .catch(error => console.error("Silme hatası:", error));
        }
    });

    // Sayfa Yüklendiğinde Başlat
    fetchActivities();
});