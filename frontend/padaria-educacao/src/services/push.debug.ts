/**
 * Sistema de debug para Web Push.
 * Todos os logs aparecem no console com prefixo [WebPush].
 * Chame debugPushStatus() no console para ver o diagnóstico completo.
 */

const PREFIX = "[WebPush]";

export function log(...args: unknown[]): void {
  console.log(PREFIX, ...args);
}

export function warn(...args: unknown[]): void {
  console.warn(PREFIX, ...args);
}

export function error(...args: unknown[]): void {
  console.error(PREFIX, ...args);
}

export async function debugPushStatus(): Promise<void> {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost";
  const base = `${apiBase.replace(/\/$/, "")}/api`;

  console.group(`${PREFIX} Diagnóstico Web Push`);
  try {
    // 1. Ambiente
    log("1. Ambiente:", {
      VITE_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY ? "✓ definido" : "✗ não definido",
      VITE_API_BASE: import.meta.env.VITE_API_BASE || "(não definido)",
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
    });

    // 2. Suporte do navegador
    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    const hasNotif = "Notification" in window;
    log("2. Suporte:", {
      serviceWorker: hasSW ? "✓" : "✗",
      PushManager: hasPush ? "✓" : "✗",
      Notification: hasNotif ? "✓" : "✗",
      suportado: hasSW && hasPush && hasNotif,
    });

    // 3. Permissão
    const permission = hasNotif ? Notification.permission : null;
    log("3. Permissão:", permission ?? "N/A");

    // 4. Service Worker
    if (hasSW) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        log("4. Service Worker:", {
          registrado: !!reg,
          scope: reg?.scope,
          state: reg?.active?.state ?? reg?.installing?.state ?? reg?.waiting?.state ?? "N/A",
        });
      } catch (e) {
        error("4. Service Worker - erro:", e);
      }
    }

    // 5. Subscrição push
    if (hasSW && hasPush) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        log("5. Subscrição push:", {
          ativa: !!sub,
          endpoint: sub?.endpoint ? `${sub.endpoint.slice(0, 50)}...` : "N/A",
        });
      } catch (e) {
        error("5. Subscrição push - erro:", e);
      }
    }

    // 6. Chave VAPID (API)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${base}/push-subscriptions/vapid-public-key`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      log("6. API VAPID:", {
        status: res.status,
        ok: res.ok,
        publicKey: data.publicKey ? "✓ recebida" : data.error ?? "✗",
      });
    } catch (e) {
      error("6. API VAPID - erro:", e);
    }

    // 7. Subscrições no backend (se logado)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${base}/push-subscriptions/debug`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        const count = data?.count ?? 0;
        log("7. Subscrições no backend:", count > 0 ? `${count} dispositivo(s) ✓` : "0 (nenhuma) ✗ - ative no painel");
      } catch (e) {
        error("7. Subscrições no backend - erro:", e);
      }
    } else {
      log("7. Subscrições no backend: usuário não logado");
    }
  } finally {
    console.groupEnd();
  }
}

// Expõe no window para chamar do console: debugPushStatus()
if (typeof window !== "undefined") {
  (window as unknown as { debugPushStatus?: () => Promise<void> }).debugPushStatus = debugPushStatus;
}
