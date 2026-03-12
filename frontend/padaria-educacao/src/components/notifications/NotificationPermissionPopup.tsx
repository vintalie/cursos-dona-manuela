import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  isPushSupported,
  getNotificationPermission,
  wasPermissionPopupShown,
  setPermissionPopupShown,
  subscribeUserAfterPermission,
} from "@/services/push.service";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPermissionPopup() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const check = async () => {
      const supported = await isPushSupported();
      if (!supported) return;

      const permission = getNotificationPermission();
      if (permission !== "default") return;

      if (wasPermissionPopupShown(user.id)) return;

      try {
        if ("serviceWorker" in navigator) {
          await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((r) => setTimeout(r, 3000)),
          ]);
        }
      } catch {
        /* ignore */
      }
      setVisible(true);
    };

    check();
  }, [user?.id]);

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      setPermissionPopupShown(user?.id ?? undefined);
      setVisible(false);

      if (permission !== "granted") return;

      window.dispatchEvent(new CustomEvent("notification-permission-granted"));
      subscribeUserAfterPermission().then((ok) => {
        window.dispatchEvent(new CustomEvent("push-subscription-attempted"));
        if (!ok) {
          toast.error("Não foi possível ativar. Use o botão no painel de notificações para tentar novamente.");
        }
      });
    } catch {
      setPermissionPopupShown(user?.id ?? undefined);
      setVisible(false);
      toast.error("Erro ao ativar notificações. Tente novamente.");
    }
  }

  function handleDeny() {
    setPermissionPopupShown(user?.id);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={handleDeny}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-800/90 text-white hover:text-red-500 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Bell className="text-primary" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Receba notificações
            </h3>
            <p className="text-sm text-muted-foreground">
              Permita notificações para receber avisos sobre cursos, medalhas e
              novidades mesmo quando não estiver na plataforma.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDeny}
            className="flex-1 py-2.5 px-4 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={handleAllow}
            className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Permitir
          </button>
        </div>
      </div>
    </div>
  );
}
