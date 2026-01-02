"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./Button";

type ModalVariant = "danger" | "warning" | "success" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconBg: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    buttonVariant: "danger" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonVariant: "primary" as const,
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    buttonVariant: "primary" as const,
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonVariant: "primary" as const,
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5",
              config.iconBg
            )}
          >
            <Icon className={cn("w-8 h-8", config.iconColor)} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <div className="text-gray-500 dark:text-gray-400 mb-6">{message}</div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              variant={config.buttonVariant}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast/Alert Modal for success/error messages
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "success",
}: AlertModalProps) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: XCircle,
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  }[variant];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 text-center">
          <div
            className={cn(
              "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4",
              config.iconBg
            )}
          >
            <Icon className={cn("w-7 h-7", config.iconColor)} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {message}
          </p>

          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
