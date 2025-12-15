document.addEventListener('DOMContentLoaded', function() {
    const createActivityForm = document.getElementById('createActivityForm');
    const imageInput = document.getElementById('image');

    createActivityForm.addEventListener('submit', function(event) {
        // 1. Formun varsayılan gönderme işlemini durdur (sayfa yenilenmesin)
        event.preventDefault();

        // 2. Formdaki verileri topla
        const name = document.getElementById('name').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;
        const capacity = document.getElementById('capacity').value;
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const category = document.getElementById('category').value;

        // 3. Backend'e gönderilecek veri objesini oluştur (DTO'ya uygun)
        const activityData = {
            name: name,
            location: location,
            description: description,
            capacity: parseInt(capacity), // Integer'a çevir
            startDate: startDate, // "YYYY-MM-DD" formatında string gider
            startTime: startTime // "HH:MM" formatında string gider
            ,
            category: category
            // Backend'inizdeki LocalDate ve LocalTime bu string formatlarını otomatik parse edecektir.
        };

        // 4. Fetch API ile POST isteği gönder
        fetch('/user-dashboard/new-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityData), // Veriyi JSON string'e çevir
            credentials: 'include' // Oturum bilgilerini (cookie) dahil et
        })
        .then(response => {
            if (!response.ok) {
                // Hata durumunda hatayı fırlat
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text(); // Başarılı mesajını al
        })
        .then(message => {
            // 5. Başarılı işlem sonrası
            console.log('Success:', message);

            const file = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
            if (!file) {
                alert(message);
                createActivityForm.reset();
                return;
            }

            // Görsel varsa: yeni oluşturulan aktivitenin id'sini bularak yükle
            return fetch('/activities/my-activities', { credentials: 'include' })
                .then(r => r.json())
                .then(data => {
                    const created = data.created || [];
                    // Eşleşme kriteri: ad, tarih, saat, konum (saat 'HH:mm' başı eşleşir)
                    const target = created
                        .filter(a => a.name === activityData.name && a.location === activityData.location && a.startDate === activityData.startDate)
                        .filter(a => {
                            const t = (a.startTime || '').toString();
                            return t.startsWith(activityData.startTime);
                        })
                        .sort((a,b) => (b.activityId||0) - (a.activityId||0))[0];

                    if (!target) {
                        alert('Activity created, but could not find it to attach the image.');
                        createActivityForm.reset();
                        return;
                    }

                    const fd = new FormData();
                    fd.append('file', file);
                    return fetch(`/activities/upload-activity-image/${target.activityId}`, {
                        method: 'POST',
                        credentials: 'include',
                        body: fd
                    })
                    .then(upRes => {
                        if (!upRes.ok) throw new Error('Image upload failed');
                        return upRes.text().catch(() => '');
                    })
                    .then(imageUrl => {
                        alert('Activity and image saved successfully.');
                        createActivityForm.reset();
                        // Redirect to dashboard to see the new activity with image
                        setTimeout(() => {
                            window.location.href = '/treffpunkt/dashboard';
                        }, 500);
                    });
                });
        })
        .catch(error => {
            // 6. Hata durumu
            console.error('Error:', error);
            alert('An error occurred while creating the activity: ' + error.message);
        });
    });
});