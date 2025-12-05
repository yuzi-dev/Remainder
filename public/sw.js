self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url,
        sound: data.sound
      },
      actions: [
        {
          action: 'view',
          title: 'View'
        }
      ]
    }
    // Try to set sound if supported (limited support)
    // Note: Browsers often ignore this for web push
    
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
 
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  const urlToOpen = event.notification.data?.url || 'https://remainder-app.vercel.app'
  event.waitUntil(
    clients.openWindow(urlToOpen)
  )
})
