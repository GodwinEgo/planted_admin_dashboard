import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconColor = "text-primary-500",
  className,
}: StatCardProps) {
  return (
    <div className={cn("stat-card group", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && trend.value !== 0 && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl bg-gray-100 dark:bg-dark-hover group-hover:scale-110 transition-transform duration-300",
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
