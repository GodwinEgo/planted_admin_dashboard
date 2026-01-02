"use client";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Baby,
  BookMarked,
  BookOpen,
  BookText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sprout,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Parents", href: "/dashboard/parents", icon: Users },
  { name: "Children", href: "/dashboard/children", icon: Baby },
  { name: "Devotionals", href: "/dashboard/devotionals", icon: BookOpen },
  { name: "Memory Verses", href: "/dashboard/memory-verses", icon: BookMarked },
  { name: "Quizzes", href: "/dashboard/quizzes", icon: HelpCircle },
  { name: "Stories", href: "/dashboard/stories", icon: BookText },
  { name: "Challenges", href: "/dashboard/challenges", icon: Trophy },
  { name: "Bulk Upload", href: "/dashboard/bulk-upload", icon: Upload },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-dark-card border border-dark-border text-white"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col z-40 transition-transform duration-300",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Planted
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      isActive ? "sidebar-link-active" : "sidebar-link"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
