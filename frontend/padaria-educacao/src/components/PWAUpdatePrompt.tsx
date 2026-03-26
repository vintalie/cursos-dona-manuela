import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PWAUpdatePrompt() {
  const { toast } = useToast();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log("[PWA] Service Worker registrado", registration?.scope);
    },
    onRegisterError(error) {
      console.warn("[PWA] Erro ao registrar SW:", error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      setOfflineReady(false);
      toast({
        title: "Pronto para usar offline",
        description: "O app está pronto para funcionar sem conexão.",
      });
    }
  }, [offlineReady, setOfflineReady, toast]);

  if (!needRefresh) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-medium">Nova versão disponível</p>
          <p className="text-sm text-muted-foreground">
            Atualize para ver as últimas alterações.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => setNeedRefresh(false)}
        >
          Depois
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => updateServiceWorker(true)}
        >
          Atualizar
        </Button>
      </div>
    </div>
  );
}
