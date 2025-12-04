document.addEventListener('DOMContentLoaded', function() {
    const createActivityForm = document.getElementById('createActivityForm');

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

        // 3. Backend'e gönderilecek veri objesini oluştur (DTO'ya uygun)
        const activityData = {
            name: name,
            location: location,
            description: description,
            capacity: parseInt(capacity), // Integer'a çevir
            startDate: startDate, // "YYYY-MM-DD" formatında string gider
            startTime: startTime // "HH:MM" formatında string gider
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
            console.log('Başarılı:', message);
            alert(message); // Kullanıcıya mesaj göster
            createActivityForm.reset(); // Formu temizle
            // İsterseniz başka bir sayfaya yönlendirebilirsiniz:
            // window.location.href = '/treffpunkt/dashboard';
        })
        .catch(error => {
            // 6. Hata durumu
            console.error('Hata:', error);
            alert('Aktivite oluşturulurken bir hata oluştu: ' + error.message);
        });
    });
});