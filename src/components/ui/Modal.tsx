"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[5vh] sm:pt-[10vh] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-200/50 dark:border-dark-border/50 overflow-hidden animate-in zoom-in-95 fade-in duration-200 my-auto",
          sizeClasses[size],
          className
        )}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="px-8 py-6 overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 80px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
