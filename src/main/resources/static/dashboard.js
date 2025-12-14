// Sayfa tamamen yüklendiğinde çalışır
window.onload = function() {
    document.body.classList.add('dashboard-body');
    fetchActivities();
    initializeCategoryCarousel();
    setupFilterHandlers();
    setupDetailBackButton();
};

let allActivities = [];

const CATEGORIES = [
    { id: 1, name: 'Sports & Fitness' },
    { id: 2, name: 'Social & Fun' },
    { id: 3, name: 'Arts & Culture' },
    { id: 4, name: 'Gastronomy & Cooking' },
    { id: 5, name: 'Nature & Adventure' },
    { id: 6, name: 'Arts, Crafts & DIY' },
    { id: 7, name: 'Technology & Innovation' },
    { id: 8, name: 'Volunteering & Community' },
    { id: 9, name: 'Wellness & Spirituality' },
    { id: 10, name: 'Gaming & Competition' },
    { id: 11, name: 'Music & Performance' },
    { id: 12, name: 'Family & Kids' },
    { id: 13, name: 'Shopping & Sustainability' },
    { id: 14, name: 'Diğer' }
];

function initializeCategoryCarousel() {
    const carousel = document.getElementById('category-carousel');
    if (!carousel) return;

    CATEGORIES.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.textContent = cat.name;
        card.addEventListener('click', () => filterByCategory(cat.name));
        carousel.appendChild(card);
    });

    // Setup carousel navigation
    const prevBtn = document.getElementById('category-prev');
    const nextBtn = document.getElementById('category-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -160, behavior: 'smooth' });
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: 160, behavior: 'smooth' });
        });
    }
}

let activeCategory = null; // Track the currently active category

function filterByCategory(categoryName) {
    const checkbox = document.getElementById('filter-remaining');
    const params = new URLSearchParams();
    
    // If the same category is clicked again, remove the filter
    if (activeCategory === categoryName) {
        activeCategory = null;
        categoryName = null;
    } else {
        activeCategory = categoryName;
    }
    
    if (categoryName && categoryName !== '') {
        params.set('category', categoryName);
    }
    if (checkbox && checkbox.checked) {
        params.set('available', 'true');
    }

    fetch('/activities?' + params.toString())
        .then(r => {
            if (!r.ok) throw new Error('Activities not found');
            return r.json();
        })
        .then(list => {
            allActivities = list || [];
            renderActivities(allActivities);
            
            // Update active category card
            const cards = document.querySelectorAll('.category-card');
            cards.forEach(c => {
                if (c.textContent === activeCategory) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        })
        .catch(err => {
            console.error('Filter error', err);
            alert('Kategori filtrelemesi yapılırken hata oluştu');
        });
}

function setupFilterHandlers() {
    const filterCheckbox = document.getElementById('filter-remaining');
    const sortSelect = document.getElementById('filter-date');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (filterCheckbox) {
        filterCheckbox.addEventListener('change', applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
}

function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
        fetchActivities();
        return;
    }

    const filtered = allActivities.filter(activity => 
        activity.name.toLowerCase().includes(query.toLowerCase()) ||
        activity.location.toLowerCase().includes(query.toLowerCase()) ||
        activity.description.toLowerCase().includes(query.toLowerCase())
    );

    renderActivities(filtered);
}

function applyFilters() {
    const onlyRemaining = document.getElementById('filter-remaining').checked;
    const dateOrder = document.getElementById('filter-date').value || 'asc';

    const params = new URLSearchParams();
    if (onlyRemaining) params.set('available', 'true');
    if (dateOrder) params.set('dateOrder', dateOrder);

    fetch('/activities?' + params.toString())
        .then(r => {
            if (!r.ok) throw new Error('Filtered activities not found');
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

    // Filter out activities whose start date-time has already passed
    const now = new Date();
    const filtered = (list || []).filter(a => {
        const dateStr = a.startDate; // expected ISO date or yyyy-MM-dd
        const timeStr = a.startTime; // expected HH:mm[:ss] or ISO
        if (!dateStr || !timeStr) return true; // if missing info, keep

        // Build a Date from date + time
        let start;
        if (typeof timeStr === 'string' && timeStr.includes('T')) {
            // full ISO provided
            start = new Date(timeStr);
        } else {
            // combine date and time strings
            const [y, m, d] = dateStr.split('-');
            const [hh, mm] = (timeStr || '').split(':');
            start = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh || '0'), parseInt(mm || '0'));
        }

        // Show only activities that haven't started yet (start > now)
        return start.getTime() > now.getTime();
    });

    if (!filtered || filtered.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg && (emptyMsg.style.display = 'none');

    const colorClasses = ['image-1', 'image-2', 'image-3', 'image-4'];

    filtered.forEach((activity, index) => {
        const aid = activity.activityId || activity.id;
        const colorClass = colorClasses[index % colorClasses.length];
        const isFull = activity.numberOfParticipants >= activity.capacity;
        const isDiscarded = activity.isDiscarded === true;
        
        const cardHTML = `
            <div class="event-card ${isDiscarded ? 'discarded-card' : ''}" data-id="${aid}" data-discarded="${isDiscarded}">
                <div class="event-card-image ${colorClass}">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="event-card-content">
                    <div class="event-card-header">
                        <h3 class="event-card-title">${escapeHtml(activity.name || 'Başlıksız Aktivite')}</h3>
                        <div class="event-card-participants">
                            <i class="fas fa-users"></i>
                            <span>${activity.numberOfParticipants || 0} participant${(activity.numberOfParticipants || 0) !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <div class="event-card-footer-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${escapeHtml(activity.location || 'Konum yok')}</span>
                        </div>
                        <div class="event-card-footer-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${formatDateOnly(activity.startDate)}</span>
                        </div>
                        <div class="event-card-footer-item">
                            <i class="fas fa-clock"></i>
                            <span>${formatTime(activity.startTime)}</span>
                        </div>
                    </div>
                    <div class="event-card-bottom">
                        <div>
                            <div class="event-host-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="event-host-name">${escapeHtml((activity.creatorName ? activity.creatorName : '') + (activity.creatorSurname ? ' ' + activity.creatorSurname : ''))}</div>
                        </div>
                        <button class="join-btn ${isFull ? 'joined' : ''} ${isDiscarded ? 'discarded-btn' : ''}" 
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
                                data-category="${escapeHtml(activity.category || '')}"
                                ${isFull || isDiscarded ? 'disabled' : ''}>
                            ${isDiscarded ? 'DISCARDED' : (isFull ? 'Full' : 'JOIN')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });

    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', handleJoinClick);
    });

    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.join-btn')) return;
            openDetailSection(card);
        });
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
const joinBtn = document.getElementById('joinBtn');

function openDetailSection(card) {
    // Always derive data from the clicked card element
    let id, name, loc, date, time, desc, capacity, number, creatorEmail, creatorName, creatorSurname, category, isDiscarded = false;

    if (!card || !card.classList || !card.classList.contains('event-card')) {
        console.warn('openDetailSection: invalid card element');
        return;
    }

    id = card.getAttribute('data-id');
    isDiscarded = card.getAttribute('data-discarded') === 'true';

    const titleEl = card.querySelector('.event-card-title');
    const footerItems = card.querySelectorAll('.event-card-footer-item');
    const joinBtnEl = card.querySelector('.join-btn');

    name = titleEl ? titleEl.textContent.trim() : '';
    loc = footerItems[0] ? footerItems[0].textContent.trim() : '';
    date = footerItems[1] ? footerItems[1].textContent.trim() : '';
    time = footerItems[2] ? footerItems[2].textContent.trim() : '';
    capacity = joinBtnEl ? joinBtnEl.getAttribute('data-capacity') : '-';
    number = joinBtnEl ? joinBtnEl.getAttribute('data-number') : '-';
    desc = joinBtnEl ? joinBtnEl.getAttribute('data-desc') : '';
    creatorEmail = joinBtnEl ? joinBtnEl.getAttribute('data-creator-email') : '';
    creatorName = joinBtnEl ? joinBtnEl.getAttribute('data-creator-name') : '';
    creatorSurname = joinBtnEl ? joinBtnEl.getAttribute('data-creator-surname') : '';
    category = joinBtnEl ? joinBtnEl.getAttribute('data-category') : '';

    document.getElementById('detail-title').textContent = name || 'Aktivite Detay';
    document.getElementById('detail-location').textContent = loc;
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-time').textContent = time;
    document.getElementById('detail-description').textContent = desc || '(Yok)';
    document.getElementById('detail-creator').textContent = (creatorName || creatorEmail || '') + (creatorSurname ? (' ' + creatorSurname) : '');
    const creatorEmailEl = document.getElementById('detail-creator-email');
    if (creatorEmailEl) creatorEmailEl.textContent = creatorEmail || '';
    document.getElementById('detail-capacity').textContent = capacity;
    document.getElementById('detail-number').textContent = number;
    const catPill = document.getElementById('detail-category-pill');
    if (catPill) catPill.textContent = category || '(Belirtilmemiş)';

    if (joinBtn) {
        joinBtn.setAttribute('data-current-id', id);
        
        // Hide join if discarded or if start time is past
        const shouldHideJoin = (() => {
            if (isDiscarded) return true;
            // Compute start Date from capacity datasets
            const ds = (joinBtnEl || {});
            const dateStr = ds.getAttribute ? ds.getAttribute('data-date') : null;
            const timeStr = ds.getAttribute ? ds.getAttribute('data-time') : null;
            if (!dateStr || !timeStr) return false;
            const [y, m, d] = (dateStr || '').split('-');
            const [hh, mm] = (timeStr || '').split(':');
            const start = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh || '0'), parseInt(mm || '0'));
            return start.getTime() <= Date.now();
        })();

        if (shouldHideJoin) {
            joinBtn.style.display = 'none';
        } else {
            // Hide join if it's my activity
            fetch('/user-dashboard/profile-info', { credentials: 'include' })
                .then(r => r.json())
                .then(profile => {
                    if (creatorEmail === profile.email) {
                        joinBtn.style.display = 'none';
                    } else {
                        joinBtn.style.display = 'block';
                    }
                })
                .catch(err => {
                    console.error('Email kontrol hatası:', err);
                    joinBtn.style.display = 'block';
                });
        }
    }

    const mainContent = document.querySelector('.dashboard-main');
    if (mainContent) mainContent.style.display = 'none';
    detailSection.style.display = 'block';
    
    // Sayfanın üstüne git
    window.scrollTo(0, 0);
}

function handleJoinClick(e) {
    e.stopPropagation();
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

    // Detay'ı aç
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
        fetch('/user-dashboard/profile-info', { credentials: 'include' })
            .then(r => r.json())
            .then(profile => {
                if (creatorEmail === profile.email) {
                    joinBtn.style.display = 'none';
                } else {
                    joinBtn.style.display = 'block';
                }
            })
            .catch(err => {
                console.error('Email kontrol hatası:', err);
                joinBtn.style.display = 'block';
            });
    }

    const mainContent = document.querySelector('.dashboard-main');
    if (mainContent) mainContent.style.display = 'none';
    detailSection.style.display = 'block';
    window.scrollTo(0, 0);
}

function setupDetailBackButton() {
    const backBtn = document.getElementById('backFromDetail');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const mainContent = document.querySelector('.dashboard-main');
            if (mainContent) mainContent.style.display = 'block';
            detailSection.style.display = 'none';
            window.scrollTo(0, 0);
        });
    }
}

// Join işlemi
if (joinBtn) {
    joinBtn.addEventListener('click', function() {
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
                const mainContent = document.querySelector('.dashboard-main');
                if (mainContent) mainContent.style.display = 'block';
                detailSection.style.display = 'none';
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
}