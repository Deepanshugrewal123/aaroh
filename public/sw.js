// Aaroh Self-Unregistering Service Worker
// Automatically unregisters legacy/orphan service workers registered on localhost/origin
// and cleans up outdated caches without intercepting application requests.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        for (const client of clients) {
          if (client.url && "navigate" in client) {
            client.navigate(client.url);
          }
        }
      })
  );
});
