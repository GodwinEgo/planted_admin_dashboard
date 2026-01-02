"use client";

import { ChildDetails } from "@/components/details/ChildDetails";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { Child } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ChildrenPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchChildren = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getChildren({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
      });
      if (response.data) {
        setChildren(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAgeGroup]);

  const handleDeleteChild = async () => {
    if (!deletingChild) return;

    setIsDeleting(true);
    try {
      await api.deleteChild(deletingChild.id);
      setDeletingChild(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Child profile deleted successfully.",
        variant: "success",
      });
      fetchChildren();
    } catch (error) {
      console.error("Failed to delete child:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete child profile. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && children.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Children
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and manage children profiles ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "SPROUT_EXPLORER", "TRAILBLAZER_TEEN"].map((ageGroup) => (
            <button
              key={ageGroup}
              onClick={() => setSelectedAgeGroup(ageGroup)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedAgeGroup === ageGroup
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
              }`}
            >
              {ageGroup === "all" ? "All Ages" : getAgeGroupLabel(ageGroup)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {children.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No children found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "No child profiles yet"
            }
            icon={<Baby className="w-12 h-12" />}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Username</th>
                  <th>Age Group</th>
                  <th>Stats</th>
                  <th>Joined</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                          {child.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {child.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Age: {child.age} • {child.gender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-600 dark:text-gray-400">
                      @{child.username}
                    </td>
                    <td>
                      <span
                        className={`badge ${getAgeGroupColor(child.ageGroup)}`}
                      >
                        {getAgeGroupLabel(child.ageGroup)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          {child.totalStars || 0}
                        </span>
                        <span className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-4 h-4" />
                          {child.streak || 0}
                        </span>
                      </div>
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {formatDate(child.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingChild(child)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingChild(child)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Child"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({total} children)
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

      {/* View Child Modal */}
      <Modal
        isOpen={!!viewingChild}
        onClose={() => setViewingChild(null)}
        title="Child Profile"
        size="xl"
      >
        {viewingChild && <ChildDetails child={viewingChild} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingChild}
        onClose={() => setDeletingChild(null)}
        onConfirm={handleDeleteChild}
        title="Delete Child Profile"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>{deletingChild?.name}</strong>'s profile? This action cannot
            be undone and all progress data will be lost.
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
