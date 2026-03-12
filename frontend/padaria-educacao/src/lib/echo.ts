import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo;
  }
}

window.Pusher = Pusher;

const key = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || "us2";

/** Verifica se o socket está configurado (chave Pusher definida) */
export function isSocketConfigured(): boolean {
  return !!key;
}

/** Retorna o estado da conexão: "connected" | "connecting" | "disconnected" | "unavailable" | "not_configured" */
export function getSocketConnectionState(): string {
  if (!key) return "not_configured";
  const echo = getEcho();
  if (!echo) return "not_configured";
  const pusher = (echo as unknown as { connector?: { pusher?: { connection?: { state?: string } } } }).connector?.pusher;
  return pusher?.connection?.state ?? "unknown";
}

export function getEcho(): Echo | null {
  if (!key) {
    if (import.meta.env.DEV) {
      console.warn("[Socket] VITE_PUSHER_APP_KEY não definido. Crie frontend/padaria-educacao/.env com VITE_PUSHER_APP_KEY e VITE_PUSHER_APP_CLUSTER.");
    }
    return null;
  }

  if (!window.Echo) {
    const apiBase = import.meta.env.VITE_API_BASE || "http://localhost";
    const base = apiBase.replace(/\/$/, "").replace(/\/api$/, "");
    window.Echo = new Echo({
      broadcaster: "pusher",
      key,
      cluster,
      forceTLS: base.startsWith("https"),
      authEndpoint: `${base}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    });
    if (import.meta.env.DEV) {
      const pusher = (window.Echo as unknown as { connector?: { pusher?: Pusher } }).connector?.pusher;
      pusher?.connection?.bind?.("state_change", (states: { current: string }) => {
        console.log("[Socket] Pusher:", states.current);
      });
    }
  }

  return window.Echo;
}
