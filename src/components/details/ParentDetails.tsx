"use client";

import api, { Child, User } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  Baby,
  BookOpen,
  Calendar,
  Flame,
  HelpCircle,
  Mail,
  ShieldCheck,
  Star,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ParentDetailsProps {
  parent: User;
}

export function ParentDetails({ parent }: ParentDetailsProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParentChildren = async () => {
      try {
        setIsLoading(true);
        const response = await api.getChildren({
          parentId: parent.id,
          limit: 50,
        });
        if (response.data) {
          setChildren(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch parent children:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentChildren();
  }, [parent.id]);

  return (
    <div className="space-y-8 text-left">
      {/* Parent Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg border border-white/20">
            {parent.firstName?.[0]}
            {parent.lastName?.[0]}
          </div>
          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {parent.firstName} {parent.lastName}
              </h2>
              {parent.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/20 text-yellow-100">
                  <XCircle className="w-3.5 h-3.5" />
                  Pending
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{parent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Joined {formatDate(parent.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm capitalize">
                  {parent.userType?.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-2">
            <Baby className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {children.length}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">
            Children
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-2">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {children.reduce((acc, c) => Math.max(acc, c.streak || 0), 0)}
          </p>
          <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">
            Best Streak
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {children.reduce((acc, c) => acc + (c.totalStars || 0), 0)}
          </p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">
            Total Stars
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {children.reduce(
              (acc, c) => acc + (c.devotionalsCompleted || 0),
              0
            )}
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">
            Devotionals
          </p>
        </div>
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary-500" />
            Children Profiles
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            {children.length} {children.length === 1 ? "child" : "children"}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary-500"></div>
            <p className="mt-4 text-sm text-gray-500">Loading children...</p>
          </div>
        ) : children.length === 0 ? (
          <div className="py-16 bg-gray-50 dark:bg-dark-hover/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-border flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-hover flex items-center justify-center mb-4">
              <Baby className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No children profiles found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              This parent hasn't added any children yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-5 rounded-2xl bg-white dark:bg-dark-hover/50 border border-gray-100 dark:border-dark-border hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/20">
                    {child.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-lg truncate">
                        {child.name}
                      </p>
                      <span className="text-xs text-gray-400">
                        @{child.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getAgeGroupColor(
                          child.ageGroup
                        )}`}
                      >
                        {getAgeGroupLabel(child.ageGroup)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Age {child.age} &bull;{" "}
                        {child.gender === "MALE" ? "Boy" : "Girl"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border/50">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {child.totalStars || 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Stars</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                      <Flame className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {child.streak || 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {child.devotionalsCompleted || 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Done</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {child.quizzesTaken || 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Quizzes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
