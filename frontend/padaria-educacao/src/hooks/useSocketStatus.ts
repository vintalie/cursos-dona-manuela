import { useEffect, useState } from "react";
import { getEcho, isSocketConfigured, getSocketConnectionState } from "@/lib/echo";

export type SocketStatus = "not_configured" | "connecting" | "connected" | "disconnected" | "unavailable" | "unknown";

export function useSocketStatus(userId?: number | null): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>(() =>
    isSocketConfigured() ? "connecting" : "not_configured"
  );

  useEffect(() => {
    if (!isSocketConfigured()) {
      setStatus("not_configured");
      return;
    }

    if (!userId) {
      setStatus("not_configured");
      return;
    }

    const echo = getEcho();
    if (!echo) {
      setStatus("not_configured");
      return;
    }

    const pusher = (echo as unknown as { connector?: { pusher?: { connection?: { bind?: (event: string, cb: (s: { current: string }) => void) => void; state?: string } } } }).connector?.pusher;
    if (!pusher?.connection) {
      setStatus("unknown");
      return;
    }

    const update = () => setStatus((getSocketConnectionState() as SocketStatus) || "unknown");

    update();
    pusher.connection.bind?.("state_change", (states: { current: string }) => {
      setStatus(states.current as SocketStatus);
    });

    return () => {
      pusher.connection.unbind?.("state_change");
    };
  }, [userId]);

  return status;
}
