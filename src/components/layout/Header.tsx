"use client";

import { useAuth } from "@/lib/auth-context";
import { Bell, Search } from "lucide-react";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-200 dark:border-dark-border">
      <div className="h-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex-1 max-w-lg lg:pl-0 pl-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-hover text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500"></span>
          </button>

          {/* User avatar (mobile only) */}
          <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
