"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DEMO_USER } from "@/lib/mockData";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { theme } = useTheme();

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-4">
        <div className="rounded-xl2 border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
              {DEMO_USER.avatarInitials}
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">{DEMO_USER.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{DEMO_USER.email}</p>
              <p className="text-xs text-slate-400">{DEMO_USER.role} · {DEMO_USER.city}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl2 border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Dark Mode</p>
              <p className="text-xs text-slate-400">Currently using {theme} theme</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="rounded-xl2 border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Notification Preferences</h3>
          <div className="space-y-3">
            {["Critical incident alerts", "Road defect confirmations", "System health warnings", "Weekly analytics digest"].map(
              (label) => (
                <label key={label} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  {label}
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400" />
                </label>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl2 border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">API Connection</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backend base URL is read from <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">NEXT_PUBLIC_API_BASE_URL</code>.
            When unset, the platform runs fully on realistic mock data for demo purposes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
