self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

async function showNotification(notificationData) {
    if (!('PushManager' in self)) {
        console.error("Push isn't supported on this browser");
        return;
    }

    if (Notification.permission === 'granted') {
        const options = {
            body: notificationData.body,
            icon: notificationData.icon,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: notificationData.tag,
            renotify: true,
            data: {}
        };

        if(notificationData.link) {
            options.data.link = notificationData.link;
        }

        try{
            await self.registration.showNotification(notificationData.title, options);
        }catch(e) {
            console.error(e.message);
            console.error("There was a problem sending the notification.");
        }
    }
}

self.addEventListener('push', async function(event) {
    if (event.data) {
        try {
            await showNotification(event.data.json());
        }catch(e) {
            console.error(e.message);
        }

    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const notificationData = event.notification.data;

    if(notificationData.link){
        event.waitUntil(clients.matchAll({
            includeUncontrolled: true,
            type: "window"
        }).then(function(clientList) {

            clientList.forEach(client => {
                if (client.url.includes(notificationData.link) && 'focus' in client) {
                    return client.focus();
                }
            });

            if (clients.openWindow) {
                return clients.openWindow(notificationData.link);
            }
        }));
    }

});