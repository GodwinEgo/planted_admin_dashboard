import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    SPROUT_EXPLORER: "Sprout Explorer (3-9)",
    TRAILBLAZER_TEEN: "Trailblazer Teen (10-17)",
    // Legacy values for content
    TODDLER: "Toddler (2-4)",
    CHILD: "Child (5-7)",
    TWEEN: "Tween (8-11)",
    TEEN: "Teen (12+)",
  };
  return labels[ageGroup] || ageGroup;
}

export function getAgeGroupColor(ageGroup: string): string {
  const colors: Record<string, string> = {
    SPROUT_EXPLORER:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    TRAILBLAZER_TEEN:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    // Legacy values for content
    TODDLER: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    CHILD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TWEEN:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    TEEN: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    colors[ageGroup] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  );
}

export function getUserTypeLabel(userType: string): string {
  const labels: Record<string, string> = {
    PARENT: "Parent",
    TEEN: "Teen",
    KID: "Kid",
  };
  return labels[userType] || userType;
}

export function getUserTypeColor(userType: string): string {
  const colors: Record<string, string> = {
    PARENT:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    TEEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    KID: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    colors[userType] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  );
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
