"use client";

import { Button, EmptyState, PageLoader } from "@/components/ui";
import { User } from "@/lib/api";
import {
  formatDate,
  getInitials,
  getUserTypeColor,
  getUserTypeLabel,
} from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock users data - replace with actual API calls
const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    isVerified: true,
    isOnboarded: true,
    role: "USER",
    userType: "PARENT",
    avatarUrl: null,
    referralCode: "SARAH123",
    parentId: null,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Brown",
    name: "Michael Brown",
    email: "michael@example.com",
    isVerified: true,
    isOnboarded: true,
    role: "USER",
    userType: "PARENT",
    avatarUrl: null,
    referralCode: "MIKE456",
    parentId: null,
    createdAt: "2024-01-14T08:15:00Z",
    updatedAt: "2024-01-14T08:15:00Z",
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Davis",
    name: "Emma Davis",
    email: "emma@example.com",
    isVerified: false,
    isOnboarded: false,
    role: "USER",
    userType: "TEEN",
    avatarUrl: null,
    referralCode: null,
    parentId: "1",
    createdAt: "2024-01-13T14:45:00Z",
    updatedAt: "2024-01-13T14:45:00Z",
  },
  {
    id: "4",
    firstName: "Tommy",
    lastName: "Williams",
    name: "Tommy Williams",
    email: "tommy@example.com",
    isVerified: true,
    isOnboarded: true,
    role: "USER",
    userType: "KID",
    avatarUrl: null,
    referralCode: null,
    parentId: "2",
    createdAt: "2024-01-12T11:20:00Z",
    updatedAt: "2024-01-12T11:20:00Z",
  },
  {
    id: "5",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    email: "admin@planted.com",
    isVerified: true,
    isOnboarded: true,
    role: "ADMIN",
    userType: "PARENT",
    avatarUrl: null,
    referralCode: "ADMIN001",
    parentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedUserType === "all" || user.userType === selectedUserType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all registered users and their profiles
          </p>
        </div>
        <Button leftIcon={<Plus className="w-5 h-5" />}>Add User</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* User type filter */}
        <div className="flex gap-2">
          {["all", "PARENT", "TEEN", "KID"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedUserType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedUserType === type
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
              }`}
            >
              {type === "all" ? "All" : getUserTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try adjusting your search or filter criteria"
            icon={<Search className="w-12 h-12" />}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                            {user.role === "ADMIN" && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getUserTypeColor(user.userType)}`}
                      >
                        {getUserTypeLabel(user.userType)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {user.isVerified ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Verified</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Pending</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === user.id ? null : user.id
                            )
                          }
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenu === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-dark-border py-1 animate-slide-up">
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover">
                                <Edit className="w-4 h-4" />
                                Edit User
                              </button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filteredUsers.length}</span>{" "}
            of <span className="font-medium">{users.length}</span> users
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>
              Previous
            </Button>
            <Button variant="secondary" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
