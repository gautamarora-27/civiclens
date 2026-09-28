"use client";

import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CITY_NAME } from "@/lib/mockData";

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
          <p className="text-xs text-slate-400">{CITY_NAME} Municipal Corporation · Smart City Mission</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
