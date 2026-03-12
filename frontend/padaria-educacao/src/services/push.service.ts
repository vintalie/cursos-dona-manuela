import api from "./api";
import { log, warn, error } from "./push.debug";

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/** Obtém o Service Worker pronto, registrando manualmente se necessário */
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const sw = navigator.serviceWorker;
  const existing = await sw.getRegistration();
  if (existing?.active) {
    return existing;
  }
  if (existing?.installing || existing?.waiting) {
    await new Promise<void>((resolve) => {
      const reg = existing;
      const check = () => {
        if (reg?.active) {
          resolve();
          return;
        }
        reg?.installing?.addEventListener("statechange", check);
        reg?.waiting?.addEventListener("statechange", check);
        if (reg?.active) resolve();
      };
      check();
      setTimeout(resolve, 30000);
    });
    return existing!;
  }
  const swPath = "/sw.js";
  log("getServiceWorkerRegistration: registrando SW manualmente:", swPath);
  const reg = await sw.register(swPath, { scope: "/" });
  await new Promise<void>((resolve, reject) => {
    const done = () => {
      clearTimeout(t);
      resolve();
    };
    const t = setTimeout(() => reject(new Error("Timeout (SW activation)")), 30000);
    if (reg.active) {
      done();
      return;
    }
    const sw = reg.installing ?? reg.waiting;
    sw?.addEventListener("statechange", () => reg.active && done());
  });
  return reg;
}

export async function getVapidPublicKey(): Promise<string> {
  if (VAPID_KEY) {
    log("getVapidPublicKey: usando chave do .env");
    return VAPID_KEY;
  }
  log("getVapidPublicKey: buscando da API...");
  const res = await api.get<{ publicKey: string }>("/push-subscriptions/vapid-public-key");
  log("getVapidPublicKey: recebido da API");
  return res.data.publicKey;
}

export async function registerPushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
  log("registerPushSubscription: enviando para backend...", { endpoint: subscription.endpoint?.slice(0, 50) + "..." });
  await api.post("/push-subscriptions", subscription);
  log("registerPushSubscription: sucesso");
}

export async function unregisterPushSubscription(endpoint: string): Promise<void> {
  await api.delete("/push-subscriptions", { data: { endpoint } });
}

export type SubscribeError = "permission_denied" | "vapid_error" | "timeout" | "api_error" | "unsupported";

export async function subscribeUser(): Promise<boolean>;
export async function subscribeUser(opts: { throwError: true }): Promise<{ ok: boolean; error?: SubscribeError }>;
export async function subscribeUser(opts?: { throwError?: true }): Promise<boolean | { ok: boolean; error?: SubscribeError }> {
  log("subscribeUser: iniciando...");
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    warn("subscribeUser: navegador não suporta");
    if (opts?.throwError) return { ok: false, error: "unsupported" };
    return false;
  }

  const permission = await Notification.requestPermission();
  log("subscribeUser: permissão =", permission);
  if (permission !== "granted") {
    warn("subscribeUser: permissão negada ou ignorada");
    if (opts?.throwError) return { ok: false, error: "permission_denied" };
    return false;
  }

  const withTimeout = <T>(promise: Promise<T>, ms: number, label?: string): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout${label ? ` (${label})` : ""}`)), ms)
      ),
    ]);

  try {
    log("subscribeUser: aguardando service worker...");
    let registration = await withTimeout(
      getServiceWorkerRegistration(),
      25000,
      "Service Worker"
    );
    log("subscribeUser: SW pronto, obtendo chave VAPID...");
    const vapidKey = await withTimeout(getVapidPublicKey(), 10000, "VAPID");
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);

    log("subscribeUser: subscrevendo no PushManager...");
    const subscription = await withTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }),
      15000,
      "PushManager.subscribe"
    );
    log("subscribeUser: subscrição obtida, registrando no backend...");

    await withTimeout(
      registerPushSubscription(subscription.toJSON()),
      10000,
      "API register"
    );
    log("subscribeUser: sucesso completo");
    window.dispatchEvent(new CustomEvent("push-subscribed"));
    if (opts?.throwError) return { ok: true };
    return true;
  } catch (err) {
    const axiosErr = err as { response?: { status?: number }; message?: string };
    let errType: SubscribeError = "api_error";
    if (axiosErr?.message === "Timeout") errType = "timeout";
    else if (axiosErr?.response?.status === 503) errType = "vapid_error";
    error("subscribeUser: falhou", errType, err);
    if (opts?.throwError) return { ok: false, error: errType };
    return false;
  }
}

export async function subscribeUserAfterPermission(): Promise<boolean> {
  log("subscribeUserAfterPermission: iniciando...");
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    warn("subscribeUserAfterPermission: não suportado");
    return false;
  }
  if (Notification.permission !== "granted") {
    log("subscribeUserAfterPermission: permissão não concedida");
    return false;
  }

  const withTimeout = <T>(promise: Promise<T>, ms: number, label?: string): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout${label ? ` (${label})` : ""}`)), ms)
      ),
    ]);

  try {
    log("subscribeUserAfterPermission: aguardando SW...");
    const registration = await withTimeout(
      getServiceWorkerRegistration(),
      25000,
      "Service Worker"
    );
    log("subscribeUserAfterPermission: SW pronto");
    const vapidKey = await withTimeout(getVapidPublicKey(), 10000, "VAPID");
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);

    const subscription = await withTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }),
      15000,
      "PushManager.subscribe"
    );

    await withTimeout(
      registerPushSubscription(subscription.toJSON()),
      10000,
      "API register"
    );
    log("subscribeUserAfterPermission: sucesso");
    window.dispatchEvent(new CustomEvent("push-subscribed"));
    return true;
  } catch (err) {
    error("subscribeUserAfterPermission: falhou", err);
    return false;
  }
}

export async function unsubscribeUser(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await unregisterPushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
    return true;
  }
  return false;
}

export async function isPushSupported(): Promise<boolean> {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  return "Notification" in window ? Notification.permission : null;
}

const POPUP_SHOWN_KEY_PREFIX = "notification-permission-popup-shown";

export function wasPermissionPopupShown(userId?: number): boolean {
  const key = userId ? `${POPUP_SHOWN_KEY_PREFIX}-${userId}` : POPUP_SHOWN_KEY_PREFIX;
  return localStorage.getItem(key) === "true";
}

export function setPermissionPopupShown(userId?: number): void {
  const key = userId ? `${POPUP_SHOWN_KEY_PREFIX}-${userId}` : POPUP_SHOWN_KEY_PREFIX;
  localStorage.setItem(key, "true");
}

export async function isSubscribed(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const ok = !!subscription;
    log("isSubscribed:", ok ? "sim" : "não");
    return ok;
  } catch (err) {
    warn("isSubscribed: erro", err);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
