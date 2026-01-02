"use client";

import { AlertModal, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { Bell, Palette, Save, Shield, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Profile saved successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save profile. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update your personal information
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {firstName?.[0]}
                    {lastName?.[0]}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                  <Button
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-5 h-5" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage how you receive notifications
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email updates about new users and activity
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive push notifications for important updates
                    </p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushNotifications
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your password and security preferences
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                  </div>
                  <Button className="mt-4">Update Password</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Customize the look and feel of your dashboard
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Theme
                </h3>
                <div className="flex gap-4">
                  <button className="p-4 rounded-xl border-2 border-primary-500 bg-gray-900 text-white">
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-gray-200 dark:border-dark-border bg-white text-gray-900">
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-gray-200 dark:border-dark-border bg-gradient-to-br from-gray-100 to-gray-900 text-gray-600">
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
}
