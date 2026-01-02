"use client";

import { Button, PageLoader, StatCard } from "@/components/ui";
import api, { DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Baby,
  BookMarked,
  BookOpen,
  BookText,
  HelpCircle,
  Plus,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.getDashboardStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with Planted today.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Parents"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Children Profiles"
          value={stats?.totalChildren || 0}
          icon={<Baby className="w-6 h-6" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Devotionals"
          value={stats?.totalDevotionals || 0}
          icon={<BookOpen className="w-6 h-6" />}
        />
        <StatCard
          title="Memory Verses"
          value={stats?.totalMemoryVerses || 0}
          icon={<BookMarked className="w-6 h-6" />}
        />
        <StatCard
          title="Quizzes"
          value={stats?.totalQuizzes || 0}
          icon={<HelpCircle className="w-6 h-6" />}
        />
        <StatCard
          title="Stories"
          value={stats?.totalStories || 0}
          icon={<BookText className="w-6 h-6" />}
        />
        <StatCard
          title="Challenges"
          value={stats?.totalChallenges || 0}
          icon={<Trophy className="w-6 h-6" />}
        />
        <StatCard
          title="Users by Type"
          value={stats?.usersByType?.length || 0}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Users by Type Breakdown */}
      {stats?.usersByType && stats.usersByType.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users by Type
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.usersByType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-hover"
                >
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {item.type?.toLowerCase() || "Unknown"}
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Signups */}
      {stats?.recentSignups && stats.recentSignups.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Signups
            </h2>
            <Link href="/dashboard/parents">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {stats.recentSignups.slice(0, 5).map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/dashboard/devotionals">
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
              <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-primary-500" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Add Devotional
              </p>
            </button>
          </Link>
          <Link href="/dashboard/memory-verses">
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
              <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-primary-500" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Add Memory Verse
              </p>
            </button>
          </Link>
          <Link href="/dashboard/quizzes">
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
              <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-primary-500" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Add Quiz
              </p>
            </button>
          </Link>
          <Link href="/dashboard/challenges">
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
              <Plus className="w-6 h-6 mx-auto text-gray-400 group-hover:text-primary-500" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Add Challenge
              </p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
