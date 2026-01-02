"use client";

import { Alert, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 animate-pulse-slow">
            <Sprout className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">Planted</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Nurturing young minds through God&apos;s word. Manage your
            children&apos;s Bible app content with ease.
          </p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">1K+</p>
              <p className="text-sm text-white/60 mt-1">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold">365</p>
              <p className="text-sm text-white/60 mt-1">Devotionals</p>
            </div>
            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-sm text-white/60 mt-1">Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-dark-bg">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sprout className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="card p-8 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Sign in to your admin account
              </p>
            </div>

            {error && (
              <Alert
                type="error"
                title="Login Failed"
                message={error}
                className="mb-6"
                onClose={() => setError("")}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="admin@planted.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                leftIcon={<Mail className="w-5 h-5" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Need admin access?{" "}
              <a
                href="#"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
