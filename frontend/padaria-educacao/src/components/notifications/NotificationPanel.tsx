import { useEffect, useRef, useState } from "react";
import { useAnimatedPresence } from "@/hooks/useAnimatedPresence";
import {
  deleteAllNotifications,
  getNotifications,
  markAsRead,
  type Notification,
  type NotificationsResponse,
} from "@/services/notification.service";
import {
  getNotificationPermission,
  isPushSupported,
  isSubscribed,
  subscribeUser,
  unsubscribeUser,
} from "@/services/push.service";
import { getEcho } from "@/lib/echo";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, CheckCheck } from "lucide-react";
import { showAlert } from "@/contexts/AlertPopupContext";

const PANEL_WIDTH = 300;

const TYPE_LABELS: Record<string, string> = {
  course_started: "Curso iniciado",
  left_incomplete: "Conteúdo não finalizado",
  badge_earned: "Medalha conquistada",
  admin_broadcast: "Aviso",
};

type NotificationPanelProps = {
  variant?: "sidebar" | "topbar";
};

export default function NotificationPanel({ variant = "sidebar" }: NotificationPanelProps) {
  const { user } = useAuth();
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(
    () => getNotificationPermission()
  );
  const [pushLoading, setPushLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  function fetchNotifications() {
    setLoading(true);
    getNotifications()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  function refreshUnreadCount() {
    getNotifications(true).then((r) => setData((prev) => (prev ? { ...prev, unread_count: r.unread_count } : { notifications: [], unread_count: r.unread_count }))).catch(() => {});
  }

  useEffect(() => {
    if (open) {
      fetchNotifications();
      refreshPushStatus();
    }
  }, [open]);

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  function refreshPushStatus() {
    setNotificationPermission(getNotificationPermission());
    isPushSupported().then((ok) => {
      setPushSupported(ok);
      if (ok) isSubscribed().then(setPushEnabled);
    });
  }

  useEffect(() => {
    refreshPushStatus();
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => refreshPushStatus();
    window.addEventListener("push-subscribed", refresh);
    window.addEventListener("push-subscription-attempted", refresh);
    window.addEventListener("notification-permission-granted", refresh);
    return () => {
      window.removeEventListener("push-subscribed", refresh);
      window.removeEventListener("push-subscription-attempted", refresh);
      window.removeEventListener("notification-permission-granted", refresh);
    };
  }, []);

  async function handleTogglePush() {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeUser();
        setPushEnabled(false);
      } else {
        const result = await subscribeUser({ throwError: true });
        const ok = typeof result === "boolean" ? result : result.ok;
        setPushEnabled(ok);
        if (!ok) {
          const err = typeof result === "object" ? result.error : undefined;
          const msg =
            err === "permission_denied"
              ? "Permissão negada. Ative as notificações nas configurações do navegador."
              : err === "vapid_error"
                ? "Servidor não configurado. Verifique as chaves VAPID no .env."
                : err === "timeout"
                  ? "Tempo esgotado. Verifique sua conexão e tente novamente."
                  : "Não foi possível ativar. Tente novamente.";
          showAlert({ type: "error", message: msg });
        }
      }
    } finally {
      setPushLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    const echo = getEcho();
    if (echo) {
      const channel = echo.private(`user.${user.id}`);
      channel.listen(".notification.created", (e: { id?: number; title?: string; message?: string }) => {
        refreshUnreadCount();
        if (openRef.current) fetchNotifications();
        if (e?.title) showAlert({ type: "info", title: e.title, message: e.message ?? "" });
      });
      return () => {
        channel.stopListening(".notification.created");
      };
    }
    return undefined;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(refreshUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  async function handleMarkAsRead(n: Notification) {
    if (n.read_at) return;
    try {
      await markAsRead(n.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              notifications: prev.notifications.map((x) =>
                x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
              ),
              unread_count: Math.max(0, prev.unread_count - 1),
            }
          : null
      );
    } catch {
      /* ignore */
    }
  }

  async function handleClearNotifications(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (markAllLoading) return;
    setMarkAllLoading(true);
    try {
      await deleteAllNotifications();
      setData({ notifications: [], unread_count: 0 });
    } catch {
      showAlert({ type: "error", message: "Não foi possível remover as notificações" });
    } finally {
      setMarkAllLoading(false);
    }
  }

  const unreadCount = data?.unread_count ?? 0;
  const { mounted: panelMounted, closing: panelClosing } = useAnimatedPresence(open, 120);

  return (
    <div className="relative flex justify-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`${variant === "topbar" ? "topbar-icon-btn" : "sidebar-icon-btn"} relative`}
        aria-label="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {panelMounted && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
            aria-hidden
          />
          <div
            className={`notification-panel absolute z-50 ${
              variant === "topbar"
                ? "top-full right-0 mt-2 notification-panel--topbar"
                : "bottom-full left-0 mb-2 notification-panel--sidebar"
            } ${panelClosing ? "is-closing" : "is-entering"}`}
            style={{
              width: variant === "topbar" ? `min(${PANEL_WIDTH}px, calc(100vw - 2rem))` : PANEL_WIDTH,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-panel-header">
              <h3>Notificações</h3>
              <div className="flex items-center gap-2">
                {pushSupported && !pushEnabled && (
                  <button
                    type="button"
                    onClick={handleTogglePush}
                    disabled={pushLoading || notificationPermission === "denied"}
                    className="text-xs hover:underline flex items-center gap-1 opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      notificationPermission === "denied"
                        ? "Ative as notificações nas configurações do navegador"
                        : "Receber notificações mesmo fora da plataforma"
                    }
                  >
                    <Bell size={14} className="hidden sm:inline-block" />
                    {notificationPermission === "denied"
                      ? "Bloqueadas"
                      : "Ativar notificações"}
                  </button>
                )}
              </div>
            </div>

            <div className="notification-panel-body">
              {loading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
              ) : !data?.notifications?.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma notificação</p>
              ) : (
                <ul className="notification-list">
                  {data.notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`notification-item ${!n.read_at ? "unread" : ""}`}
                      onClick={() => handleMarkAsRead(n)}
                    >
                      <div className="notification-item-content">
                        <span className="notification-type">{TYPE_LABELS[n.type] ?? n.type}</span>
                        <p className="notification-title">{n.title}</p>
                        {n.message && (
                          <p className="notification-message">{n.message}</p>
                        )}
                        <span className="notification-date">
                          {new Date(n.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {!n.read_at && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n);
                          }}
                          className="notification-mark-btn"
                          title="Marcar como lida"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {data?.notifications?.length ? (
              <div className="notification-panel-footer">
                <button
                  type="button"
                  onClick={(e) => handleClearNotifications(e)}
                  disabled={markAllLoading}
                  className="flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CheckCheck size={14} />
                  {markAllLoading ? "Limpando..." : "Limpar notificações"}
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
