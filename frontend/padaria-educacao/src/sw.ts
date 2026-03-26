import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

/* Assets (JS/CSS): NetworkFirst – rede primeiro, cache só offline.
 * Registrado ANTES do precache para evitar tela branca: SW antigo não força cache de assets antigos. */
registerRoute(
  ({ url }) => url.pathname.startsWith("/assets/"),
  new NetworkFirst({ cacheName: "assets-runtime", networkTimeoutSeconds: 10 })
);

precacheAndRoute(self.__WB_MANIFEST ?? []);

/* Navegação: NetworkFirst – busca index.html na rede primeiro; usa precache só offline.
 * Evita tela branca após deploy: SW antigo não serve index.html em cache com URLs de assets antigos. */
const precacheFallback = createHandlerBoundToURL("/index.html");
const navigationHandler = async (ctx: { request: Request }) => {
  try {
    const res = await fetch(ctx.request);
    if (res?.ok) return res;
  } catch {
    /* offline – usar precache */
  }
  return precacheFallback(ctx);
};
registerRoute(new NavigationRoute(navigationHandler));

/* ===== WEB PUSH – Notificações nativas do sistema operacional ===== */
self.addEventListener("push", (event: PushEvent) => {
  console.log("[WebPush SW] push recebido", event.data ? "com dados" : "sem dados");
  if (!event.data) return;

  let payload: { title?: string; body?: string; data?: { url?: string; id?: number; type?: string } } = {
    title: "Padaria Educação",
    body: "",
  };

  try {
    const parsed = event.data.json();
    payload = {
      title: parsed.title ?? payload.title,
      body: parsed.body ?? parsed.message ?? "",
      data: parsed.data ?? {},
    };
    console.log("[WebPush SW] payload parseado:", { title: payload.title, body: payload.body?.slice(0, 50) });
  } catch (e) {
    console.warn("[WebPush SW] erro ao parsear JSON:", e);
    try {
      payload.body = event.data.text();
    } catch {
      payload.body = "Nova notificação";
    }
  }

  const title = payload.title ?? "Padaria Educação";
  const body = payload.body ?? "Você tem uma nova notificação";
  const baseUrl = self.location.origin;
  const iconUrl = `${baseUrl}/favicon.svg`;

  const options: NotificationOptions = {
    body,
    icon: iconUrl,
    badge: iconUrl,
    tag: `padaria-edu-${payload.data?.id ?? Date.now()}`,
    data: payload.data ?? {},
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Fechar" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(
      () => console.log("[WebPush SW] notificação exibida:", title),
      (e) => console.error("[WebPush SW] erro ao exibir:", e)
    )
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("[WebPush SW] notificationclick", event.action);
  event.notification.close();

  if (event.action === "close") return;

  const data = event.notification.data ?? {};
  const path = data.url ?? "/dashboard";
  const url = path.startsWith("http") ? path : new URL(path, self.location.origin).toString();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
