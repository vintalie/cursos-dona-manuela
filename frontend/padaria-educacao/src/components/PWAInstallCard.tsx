import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISSED_KEY = "pwa-install-dismissed";

export default function PWAInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setDismissed(true);
        localStorage.setItem(DISMISSED_KEY, "true");
      }
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, "true");
  }

  const showCard =
    !dismissed &&
    !isStandalone &&
    (deferredPrompt !== null || (isIOS && !dismissed));

  if (!showCard) return null;

  return (
    <div className="pwa-install-card">
      <button
        type="button"
        onClick={handleDismiss}
        className="pwa-install-card-close"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
      <div className="pwa-install-card-content">
        <div className="pwa-install-card-icon">
          <Download size={24} />
        </div>
        <div>
          <h4 className="pwa-install-card-title">Instalar o app</h4>
          <p className="pwa-install-card-text">
            {isIOS
              ? "Toque em Compartilhar e depois em \"Adicionar à Tela de Início\" para instalar."
              : "Instale o Padaria Educação no seu dispositivo para acesso rápido."}
          </p>
        </div>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          className="pwa-install-card-btn"
        >
          Instalar
        </button>
      )}
    </div>
  );
}
