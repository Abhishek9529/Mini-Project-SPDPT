// ===== SPDPT Smart Task Reminder - Service Worker =====

const CACHE_NAME = 'spdpt-sw-v1';

// Install event
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_MORNING_REMINDER') {
        const { studentName, pendingCount, backlogCount } = event.data.payload;
        scheduleOrShowReminder(studentName, pendingCount, backlogCount);
    }

    if (event.data && event.data.type === 'SHOW_NOW') {
        const { studentName, pendingCount, backlogCount } = event.data.payload;
        showMorningNotification(studentName, pendingCount, backlogCount);
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus existing tab if open
            for (const client of clientList) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new tab
            if (self.clients.openWindow) {
                return self.clients.openWindow('/dashboard');
            }
        })
    );
});

// Show the morning notification
function showMorningNotification(studentName, pendingCount, backlogCount) {
    const name = studentName || 'Student';
    const total = (pendingCount || 0) + (backlogCount || 0);

    let title = `🌅 Good Morning, ${name}!`;
    let body = '';

    if (total === 0) {
        body = "You're all caught up! Great job. Have a productive day! 🎉";
    } else {
        const parts = [];
        if (pendingCount > 0) parts.push(`${pendingCount} task${pendingCount > 1 ? 's' : ''} for today`);
        if (backlogCount > 0) parts.push(`${backlogCount} pending backlog item${backlogCount > 1 ? 's' : ''}`);
        body = `You have ${parts.join(' and ')}. Let's get started! 💪`;
    }

    return self.registration.showNotification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'spdpt-morning-reminder',
        renotify: true,
        requireInteraction: false,
        actions: [
            { action: 'open', title: '📋 View Dashboard' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        data: {
            url: '/dashboard',
            timestamp: Date.now()
        }
    });
}

// Schedule reminder using setTimeout (works while SW is alive)
function scheduleOrShowReminder(studentName, pendingCount, backlogCount) {
    const now = new Date();
    const morningHour = 8; // 8:00 AM

    // Calculate milliseconds until next 8 AM
    let target = new Date(now);
    target.setHours(morningHour, 0, 0, 0);

    // If it's already past 8 AM today, schedule for tomorrow 8 AM
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }

    const msUntilMorning = target.getTime() - now.getTime();

    // Store scheduling info in IndexedDB for persistence across SW restarts
    storeScheduleInfo({ studentName, pendingCount, backlogCount, nextFire: target.getTime() });

    // Set timeout for this SW session
    setTimeout(() => {
        showMorningNotification(studentName, pendingCount, backlogCount);
    }, msUntilMorning);
}

// Simple IndexedDB helpers
function storeScheduleInfo(data) {
    const request = indexedDB.open('spdpt-reminders', 1);

    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('schedule')) {
            db.createObjectStore('schedule', { keyPath: 'id' });
        }
    };

    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('schedule', 'readwrite');
        const store = tx.objectStore('schedule');
        store.put({ id: 'morning', ...data });
    };
}
