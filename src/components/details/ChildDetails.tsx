"use client";

import api, { Child } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Flame,
  HelpCircle,
  Scroll,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ChildDetailsProps {
  child: Child;
}

export function ChildDetails({ child }: ChildDetailsProps) {
  const [parentName, setParentName] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentName = async () => {
      if (child.parentId) {
        try {
          const response = await api.getUser(child.parentId);
          if (response.data) {
            const parent = response.data.user;
            setParentName(`${parent.firstName} ${parent.lastName}`);
          }
        } catch (error) {
          console.error("Failed to fetch parent:", error);
          setParentName(null);
        }
      }
    };

    fetchParentName();
  }, [child.parentId]);

  return (
    <div className="space-y-8 text-left">
      {/* Child Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-400 via-accent-500 to-primary-500 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg border border-white/20">
            {child.name?.[0]}
          </div>
          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold">{child.name}</h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getAgeGroupColor(
                  child.ageGroup
                )}`}
              >
                {getAgeGroupLabel(child.ageGroup)}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">@{child.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Age {child.age}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {child.gender === "MALE" ? "👦 Boy" : "👧 Girl"}
                </span>
              </div>
              {parentName && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Parent: {parentName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-3">
            <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" />
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {child.totalStars || 0}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium mt-1">
            Total Stars
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {child.streak || 0}
          </p>
          <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium mt-1">
            Day Streak
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {child.devotionalsCompleted || 0}
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 font-medium mt-1">
            Devotionals
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
            <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {child.quizzesTaken || 0}
          </p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium mt-1">
            Quizzes Taken
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-hover/50 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Scroll className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {child.versesMemorized || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verses Memorized
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-dark-hover/50 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {child.averageQuizScore || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg Quiz Score
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
          <span>Avatar: {child.avatarId || "Default"}</span>
          <span>Joined: {formatDate(child.createdAt)}</span>
          <span>Last Updated: {formatDate(child.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
