"use client";

import { DevotionalForm } from "@/components/forms/DevotionalForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { Devotional } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  BookText,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function DevotionalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(
    null
  );
  const [deletingDevotional, setDeletingDevotional] =
    useState<Devotional | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchDevotionals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getDevotionals({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
      });
      if (response.data) {
        setDevotionals(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch devotionals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAgeGroup]);

  const handleDelete = async () => {
    if (!deletingDevotional) return;

    setIsDeleting(true);
    try {
      await api.deleteDevotional(deletingDevotional.id);
      setDeletingDevotional(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Devotional deleted successfully.",
        variant: "success",
      });
      fetchDevotionals();
    } catch (error) {
      console.error("Failed to delete devotional:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete devotional. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<Devotional>) => {
    setIsSubmitting(true);
    try {
      if (editingDevotional) {
        await api.updateDevotional(editingDevotional.id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Devotional updated successfully!",
          variant: "success",
        });
      } else {
        await api.createDevotional(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Devotional created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingDevotional(null);
      fetchDevotionals();
    } catch (error) {
      console.error("Failed to save devotional:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save devotional. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingDevotional(null);
    setIsModalOpen(true);
  };

  const openEditModal = (devotional: Devotional) => {
    setEditingDevotional(devotional);
    setIsModalOpen(true);
  };

  if (isLoading && devotionals.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Devotionals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage daily devotional content ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Devotional
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devotionals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "SPROUT_EXPLORER", "TRAILBLAZER_TEEN", "PARENT"].map(
            (ageGroup) => (
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
            )
          )}
        </div>
      </div>

      {/* Grid */}
      {devotionals.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No devotionals found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first devotional"
            }
            icon={<BookText className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Devotional
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devotionals.map((devotional) => (
              <div
                key={devotional.id}
                className="card group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full"
              >
                {devotional.imageUrl ? (
                  <img
                    src={devotional.imageUrl}
                    alt={devotional.title}
                    className="h-40 w-full object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center rounded-t-2xl">
                    <BookText className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`badge ${getAgeGroupColor(
                        devotional.audience || ""
                      )}`}
                    >
                      {getAgeGroupLabel(devotional.audience || "")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          /* TODO: View */
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(devotional)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingDevotional(devotional)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {devotional.title}
                  </h3>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                    {devotional.bibleReference}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                    {devotional.content?.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span className="text-xs text-gray-400">
                      Pub:{" "}
                      {formatDate(
                        devotional.publishDate || devotional.createdAt
                      )}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        devotional.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {devotional.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages} ({total} devotionals)
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
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDevotional(null);
        }}
        title={editingDevotional ? "Edit Devotional" : "Add New Devotional"}
        size="xl"
      >
        <DevotionalForm
          initialData={editingDevotional || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDevotional}
        onClose={() => setDeletingDevotional(null)}
        onConfirm={handleDelete}
        title="Delete Devotional"
        message={
          <>
            Are you sure you want to delete "
            <strong>{deletingDevotional?.title}</strong>"? This action cannot be
            undone.
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
