"use client";

import { MemoryVerseForm } from "@/components/forms/MemoryVerseForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { MemoryVerse } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MemoryVersesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [memoryVerses, setMemoryVerses] = useState<MemoryVerse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVerse, setEditingVerse] = useState<MemoryVerse | null>(null);
  const [deletingVerse, setDeletingVerse] = useState<MemoryVerse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchMemoryVerses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getMemoryVerses({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
      });
      if (response.data) {
        setMemoryVerses(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch memory verses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    fetchMemoryVerses();
  }, [fetchMemoryVerses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAgeGroup]);

  const handleDelete = async () => {
    if (!deletingVerse) return;

    setIsDeleting(true);
    try {
      await api.deleteMemoryVerse(deletingVerse.id);
      setDeletingVerse(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Memory verse deleted successfully.",
        variant: "success",
      });
      fetchMemoryVerses();
    } catch (error) {
      console.error("Failed to delete memory verse:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete memory verse. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<MemoryVerse>) => {
    setIsSubmitting(true);
    try {
      if (editingVerse) {
        await api.updateMemoryVerse(editingVerse.id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Memory verse updated successfully!",
          variant: "success",
        });
      } else {
        await api.createMemoryVerse(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Memory verse created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingVerse(null);
      fetchMemoryVerses();
    } catch (error) {
      console.error("Failed to save memory verse:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save memory verse. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingVerse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (verse: MemoryVerse) => {
    setEditingVerse(verse);
    setIsModalOpen(true);
  };

  if (isLoading && memoryVerses.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Memory Verses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage weekly memory verse content ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Memory Verse
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference or text..."
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

      {/* Grid */}
      {memoryVerses.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No memory verses found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first memory verse"
            }
            icon={<BookMarked className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Memory Verse
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memoryVerses.map((verse) => (
              <div
                key={verse.id}
                className="card group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`badge ${getAgeGroupColor(
                        verse.audience || ""
                      )}`}
                    >
                      {getAgeGroupLabel(verse.audience || "")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(verse)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingVerse(verse)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
                    {verse.reference}
                  </h3>
                  <blockquote className="text-gray-700 dark:text-gray-300 italic border-l-4 border-primary-500 pl-4 mb-4">
                    &ldquo;{verse.verseText || verse.text}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Pub: {formatDate(verse.publishDate)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        verse.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {verse.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages} ({total} memory verses)
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
          setEditingVerse(null);
        }}
        title={editingVerse ? "Edit Memory Verse" : "Add New Memory Verse"}
        size="xl"
      >
        <MemoryVerseForm
          initialData={editingVerse || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingVerse}
        onClose={() => setDeletingVerse(null)}
        onConfirm={handleDelete}
        title="Delete Memory Verse"
        message={
          <>
            Are you sure you want to delete the memory verse "
            <strong>{deletingVerse?.reference}</strong>"? This action cannot be
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
