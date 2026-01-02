"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  className?: string;
  onClose?: () => void;
}

const alertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const alertStyles = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
  error:
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
};

export function Alert({
  type,
  title,
  message,
  className,
  onClose,
}: AlertProps) {
  const Icon = alertIcons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        alertStyles[type],
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="mt-1 text-sm opacity-80">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
