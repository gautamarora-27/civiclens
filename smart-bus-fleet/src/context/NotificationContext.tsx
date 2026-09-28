"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

export type ToastKind = "info" | "success" | "warning" | "critical";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface NotificationContextValue {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast]
  );

  return (
    <NotificationContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
