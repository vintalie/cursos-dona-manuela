"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle2, XCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AlertType = "success" | "error" | "info";

export interface AlertConfig {
  type: AlertType;
  title?: string;
  message: string;
}

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const iconConfig = {
  success: {
    Icon: CheckCircle2,
    className: "text-green-600 animate-in zoom-in-50 duration-300",
    bgClassName: "bg-green-100 dark:bg-green-900/30",
  },
  error: {
    Icon: XCircle,
    className: "text-destructive animate-in zoom-in-50 duration-300",
    bgClassName: "bg-destructive/10",
  },
  info: {
    Icon: Info,
    className: "text-blue-600 animate-in zoom-in-50 duration-300",
    bgClassName: "bg-blue-100 dark:bg-blue-900/30",
  },
};

interface AlertPopupProps {
  config: AlertConfig | null;
  open: boolean;
  onClose: () => void;
}

export function AlertPopup({ config, open, onClose }: AlertPopupProps) {
  if (!config) return null;

  const { Icon, className, bgClassName } = iconConfig[config.type];
  const title = config.title ?? (config.type === "success" ? "Sucesso" : config.type === "error" ? "Erro" : "Informação");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col items-center text-center gap-4" onPointerDownOutside={onClose}>
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            bgClassName
          )}
        >
          <Icon className={cn("h-10 w-10", className)} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{config.message}</p>
        </div>
        <Button onClick={onClose} className="min-w-[120px]">
          Ok
        </Button>
      </DialogContent>
    </Dialog>
  );
}
