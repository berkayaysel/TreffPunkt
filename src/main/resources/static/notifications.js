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

function showRemovalReasonPopup(reason) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:10000;';
    
    const popup = document.createElement('div');
    popup.style.cssText = 'background:white;padding:30px;border-radius:8px;max-width:500px;width:90%;box-shadow:0 4px 15px rgba(0,0,0,0.2);';
    
    popup.innerHTML = `
        <h3 style="margin:0 0 15px 0;color:#333;">Removal Reason</h3>
        <div style="padding:15px;background:#f8f9fa;border-radius:4px;border-left:4px solid #dc3545;margin-bottom:20px;">
            <p style="margin:0;color:#495057;line-height:1.5;">${reason}</p>
        </div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px;">Close</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
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
                        <div class="notif-title">${n.activityName ? n.activityName : 'Activity'}</div>
                        <div class="notif-body">${n.message}</div>
                        <div class="notif-meta"><small>${new Date(n.timestamp).toLocaleString()}</small></div>
                    </div>
                    <div style="margin-left:8px">
                        <button class="notif-dismiss" title="Close">×</button>
                    </div>
                </div>
        `;
        // Click behavior by type
        if (n.type === 'ACTIVITY_DELETED') {
            // Disabled click for deleted activity notifications
            li.style.cursor = 'default';
        } else {
            const clickHandler = (e) => { 
                e.stopPropagation(); 
                if (n.removalReason) {
                    showRemovalReasonPopup(n.removalReason);
                } else {
                    window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); 
                }
            };
            li.querySelector('.notif-title').addEventListener('click', clickHandler);
            li.querySelector('.notif-body').addEventListener('click', clickHandler);
        }
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
                                        <div class="notif-title">${n.activityName ? n.activityName : 'Activity'}</div>
                                        <div class="notif-body">${n.message}</div>
                                        <div class="notif-meta"><small>${new Date(n.timestamp).toLocaleString()}</small></div>
                                    </div>
                                    <div style="margin-left:8px">
                                        <button class="notif-dismiss" title="Close">×</button>
                                    </div>
                                </div>
                        `;
                        const dismiss = li.querySelector('.notif-dismiss');
                        dismiss.addEventListener('click', async (ev) => { ev.stopPropagation(); try { await fetch('/treffpunkt/notifications/' + n.id + '/read', { method: 'POST' }); } catch(e){} li.remove(); updateBadgeCount(-1); });
                        // Click behavior by type
                        if (n.type !== 'ACTIVITY_DELETED') {
                            const clickHandler = (e) => { 
                                e.stopPropagation(); 
                                if (n.removalReason) {
                                    showRemovalReasonPopup(n.removalReason);
                                } else {
                                    window.location.href = '/treffpunkt/activities/' + (n.activityId || ''); 
                                }
                            };
                            li.querySelector('.notif-title').addEventListener('click', clickHandler);
                            li.querySelector('.notif-body').addEventListener('click', clickHandler);
                        } else {
                            li.style.cursor = 'default';
                        }
                        
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
