"use client";

import { ParentDetails } from "@/components/details/ParentDetails";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { User } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ParentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [parents, setParents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [viewingParent, setViewingParent] = useState<User | null>(null);
  const [deletingParent, setDeletingParent] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchParents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getUsers({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        userType: "PARENT",
      });
      if (response.data) {
        setParents(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch parents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeleteUser = async () => {
    if (!deletingParent) return;

    setIsDeleting(true);
    try {
      await api.deleteUser(deletingParent.id);
      setDeletingParent(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message:
          "Parent account and all associated children have been deleted.",
        variant: "success",
      });
      fetchParents();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete parent account. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && parents.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Parents
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage parent accounts ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {parents.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No parents found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "No parent accounts yet"
            }
            icon={<Users className="w-12 h-12" />}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-dark-hover/50 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                          {parent.firstName?.[0]}
                          {parent.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {parent.firstName} {parent.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-600 dark:text-gray-400 font-medium">
                      {parent.email}
                    </td>
                    <td>
                      {parent.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <XCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {formatDate(parent.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingParent(parent)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingParent(parent)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Parent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-dark-border">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing {parents.length} of {total} parents
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Parent Modal */}
      <Modal
        isOpen={!!viewingParent}
        onClose={() => setViewingParent(null)}
        title="Parent Account Details"
        size="xl"
      >
        {viewingParent && <ParentDetails parent={viewingParent} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingParent}
        onClose={() => setDeletingParent(null)}
        onConfirm={handleDeleteUser}
        title="Delete Parent Account"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>
              {deletingParent?.firstName} {deletingParent?.lastName}
            </strong>
            's account? This will also delete all their children profiles. This
            action cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

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
