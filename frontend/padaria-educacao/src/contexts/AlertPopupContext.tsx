"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertPopup, type AlertConfig, type AlertType } from "@/components/ui/alert-popup";

type ShowAlertOptions =
  | { type: AlertType; title?: string; message: string }
  | string;

interface AlertPopupContextValue {
  showAlert: (options: ShowAlertOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertPopupContext = createContext<AlertPopupContextValue | null>(null);

let globalShowAlert: ((options: ShowAlertOptions) => void) | null = null;

export function setGlobalAlertHandler(handler: ((options: ShowAlertOptions) => void) | null) {
  globalShowAlert = handler;
}

export function showAlert(options: ShowAlertOptions) {
  if (globalShowAlert) {
    globalShowAlert(options);
  }
}

export function AlertPopupProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [open, setOpen] = useState(false);

  const handleShow = useCallback((options: ShowAlertOptions) => {
    const cfg: AlertConfig =
      typeof options === "string"
        ? { type: "success", message: options }
        : {
            type: options.type,
            title: options.title,
            message: options.message,
          };
    setConfig(cfg);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setConfig(null);
  }, []);

  React.useEffect(() => {
    setGlobalAlertHandler(handleShow);
    return () => setGlobalAlertHandler(null);
  }, [handleShow]);

  const value: AlertPopupContextValue = {
    showAlert: handleShow,
    showSuccess: (message, title) => handleShow({ type: "success", message, title }),
    showError: (message, title) => handleShow({ type: "error", message, title }),
    showInfo: (message, title) => handleShow({ type: "info", message, title }),
  };

  return (
    <AlertPopupContext.Provider value={value}>
      {children}
      <AlertPopup config={config} open={open} onClose={handleClose} />
    </AlertPopupContext.Provider>
  );
}

export function useAlertPopup() {
  const ctx = useContext(AlertPopupContext);
  if (!ctx) {
    return {
      showAlert: (o: ShowAlertOptions) => {
        if (typeof o === "string") showAlert(o);
        else showAlert(o);
      },
      showSuccess: (m: string, t?: string) => showAlert({ type: "success", message: m, title: t }),
      showError: (m: string, t?: string) => showAlert({ type: "error", message: m, title: t }),
      showInfo: (m: string, t?: string) => showAlert({ type: "info", message: m, title: t }),
    };
  }
  return ctx;
}
