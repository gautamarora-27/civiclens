"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useNotifications, ToastKind } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

const iconMap: Record<ToastKind, JSX.Element> = {
  info: <Info size={18} className="text-brand-600" />,
  success: <CheckCircle2 size={18} className="text-emerald-600" />,
  warning: <AlertTriangle size={18} className="text-amber-600" />,
  critical: <XCircle size={18} className="text-red-600" />,
};

const borderMap: Record<ToastKind, string> = {
  info: "border-l-brand-600",
  success: "border-l-emerald-600",
  warning: "border-l-amber-600",
  critical: "border-l-red-600",
};

export function ToastStack() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "animate-slideIn flex items-start gap-3 rounded-lg border-l-4 bg-white p-3 shadow-panel dark:bg-slate-900",
            borderMap[toast.kind]
          )}
        >
          <div className="mt-0.5">{iconMap[toast.kind]}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{toast.title}</p>
            {toast.message && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.message}</p>}
          </div>
          <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
