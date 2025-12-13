// notifications.js - connects to STOMP WebSocket and shows simple toasts
let stompClient = null;

function connectNotifications() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        stompClient.subscribe('/user/queue/notifications', function(message) {
            try {
                const payload = JSON.parse(message.body);
                showToast(payload.message);
                prependNotificationToList(payload);
                updateBadgeCount(1);
            } catch (e) {
                console.error('Invalid notification payload', e);
            }
        });
    });
}

function showToast(text) {
    const t = document.createElement('div');
    t.className = 'np-toast';
    t.innerText = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 50);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 5000);
}

function prependNotificationToList(n) {
    const ul = document.getElementById('notification-list');
    if (!ul) return;
    const li = document.createElement('li');
    li.dataset.id = n.id;
        li.className = 'notif-item';
        li.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div style="flex:1;min-width:0">
                        <div class="notif-title">${n.activityName ? n.activityName : 'Etkinlik'}</div>
                        <div class="notif-body">${n.message}</div>
                        <div class="notif-meta"><small>${new Date(n.timestamp).toLocaleString()}</small></div>
                    </div>
                    <div style="margin-left:8px">
                        <button class="notif-dismiss" title="Kapat">×</button>
                    </div>
                </div>
        `;
        // navigate on clicking body
        li.querySelector('.notif-title').addEventListener('click', (e) => { e.stopPropagation(); window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); });
        li.querySelector('.notif-body').addEventListener('click', (e) => { e.stopPropagation(); window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); });
        const btn = li.querySelector('.notif-dismiss');
        btn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                try {
                        await fetch('/treffpunkt/notifications/' + n.id + '/read', { method: 'POST' });
                } catch (e) { /* ignore */ }
                li.remove();
                updateBadgeCount(-1);
        });
        ul.prepend(li);
}

function updateBadgeCount(delta) {
    const b = document.getElementById('notification-badge');
    if (!b) return;
    let v = parseInt(b.innerText || '0');
    v = Math.max(0, v + delta);
    b.innerText = v > 0 ? v : '';
}

async function loadNotifications() {
    try {
        const res = await fetch('/treffpunkt/notifications');
        if (!res.ok) return;
        const list = await res.json();
        const ul = document.getElementById('notification-list');
        if (!ul) return;
        ul.innerHTML = '';
        let unread = 0;
                list.forEach(n => {
                        const li = document.createElement('li');
                        li.dataset.id = n.id;
                        li.className = 'notif-item';
                        li.innerHTML = `
                                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                    <div style="flex:1;min-width:0">
                                        <div class="notif-title">${n.activityName ? n.activityName : 'Etkinlik'}</div>
                                        <div class="notif-body">${n.message}</div>
                                        <div class="notif-meta"><small>${new Date(n.timestamp).toLocaleString()}</small></div>
                                    </div>
                                    <div style="margin-left:8px">
                                        <button class="notif-dismiss" title="Kapat">×</button>
                                    </div>
                                </div>
                        `;
                        const dismiss = li.querySelector('.notif-dismiss');
                        dismiss.addEventListener('click', async (ev) => { ev.stopPropagation(); try { await fetch('/treffpunkt/notifications/' + n.id + '/read', { method: 'POST' }); } catch(e){} li.remove(); updateBadgeCount(-1); });
                        li.querySelector('.notif-title').addEventListener('click', (e) => { e.stopPropagation(); window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); });
                        li.querySelector('.notif-body').addEventListener('click', (e) => { e.stopPropagation(); window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); });
                        ul.appendChild(li);
                        if (!n.read) unread++;
                });
        const b = document.getElementById('notification-badge');
        if (b) b.innerText = unread > 0 ? unread : '';
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') return;
    connectNotifications();
    loadNotifications();
    const toggle = document.getElementById('notification-toggle');
    if (toggle) toggle.addEventListener('click', (e) => {
        const dd = document.getElementById('notification-dropdown');
        if (dd) dd.classList.toggle('open');
    });
});

// expose for manual testing
window.loadNotifications = loadNotifications;
