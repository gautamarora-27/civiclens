"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Bus as BusIcon,
  AlertTriangle,
  MapPinned,
  BarChart3,
  PlaySquare,
  ServerCog,
  Settings,
  LogOut,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_USER } from "@/lib/mockData";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-detection", label: "Live Detection", icon: Video },
  { href: "/fleet", label: "Fleet", icon: BusIcon },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/road-verification", label: "Road Verification", icon: MapPinned },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/playback", label: "Playback", icon: PlaySquare },
  { href: "/system-health", label: "System Health", icon: ServerCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Radio size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">Smart Bus Fleet</p>
          <p className="text-[11px] text-slate-400">Urban Sensing Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {DEMO_USER.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{DEMO_USER.name}</p>
            <p className="truncate text-xs text-slate-400">{DEMO_USER.role}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            aria-label="Logout"
            className="text-slate-400 hover:text-red-500"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
