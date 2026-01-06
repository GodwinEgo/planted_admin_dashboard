"use client";

import { KeyLessonForm } from "@/components/forms/KeyLessonForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { KeyLesson } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function KeyLessonsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [keyLessons, setKeyLessons] = useState<KeyLesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingKeyLesson, setViewingKeyLesson] = useState<KeyLesson | null>(null);
  const [editingKeyLesson, setEditingKeyLesson] = useState<KeyLesson | null>(null);
  const [deletingKeyLesson, setDeletingKeyLesson] = useState<KeyLesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchKeyLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getKeyLessons({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        audience: selectedAudience !== "all" ? selectedAudience : undefined,
      });
      // API returns { status, data: KeyLesson[], pagination: {...} }
      const lessons = Array.isArray(response.data) ? response.data : [];
      setKeyLessons(lessons);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch key lessons:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAudience]);

  useEffect(() => {
    fetchKeyLessons();
  }, [fetchKeyLessons]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAudience]);

  const handleDelete = async () => {
    if (!deletingKeyLesson) return;

    setIsDeleting(true);
    try {
      await api.deleteKeyLesson(deletingKeyLesson._id);
      setDeletingKeyLesson(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Key lesson deleted successfully.",
        variant: "success",
      });
      fetchKeyLessons();
    } catch (error) {
      console.error("Failed to delete key lesson:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete key lesson. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<KeyLesson>) => {
    setIsSubmitting(true);
    try {
      if (editingKeyLesson) {
        await api.updateKeyLesson(editingKeyLesson._id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Key lesson updated successfully!",
          variant: "success",
        });
      } else {
        await api.createKeyLesson(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Key lesson created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingKeyLesson(null);
      fetchKeyLessons();
    } catch (error) {
      console.error("Failed to save key lesson:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save key lesson. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingKeyLesson(null);
    setIsModalOpen(true);
  };

  const openEditModal = (keyLesson: KeyLesson) => {
    setEditingKeyLesson(keyLesson);
    setIsModalOpen(true);
  };

  if (isLoading && keyLessons.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Key Lessons
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage daily key lessons for children ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Key Lesson
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by bible reading or dayId..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "SPROUT_EXPLORER", "TRAILBLAZER_TEEN"].map((audience) => (
            <button
              key={audience}
              onClick={() => setSelectedAudience(audience)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedAudience === audience
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
              }`}
            >
              {audience === "all" ? "All Ages" : getAgeGroupLabel(audience)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {keyLessons.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No key lessons found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first key lesson"
            }
            icon={<BookOpenCheck className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Key Lesson
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyLessons.map((keyLesson) => (
              <div
                key={keyLesson._id}
                className="card group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full"
              >
                {/* Header with gradient */}
                <div className="h-24 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center rounded-t-2xl relative">
                  <BookOpenCheck className="w-10 h-10 text-white" />
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-white">
                      {keyLesson.dayId}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`badge ${getAgeGroupColor(keyLesson.audience)}`}
                    >
                      {getAgeGroupLabel(keyLesson.audience)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingKeyLesson(keyLesson)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(keyLesson)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingKeyLesson(keyLesson)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                    {keyLesson.bibleReading}
                  </p>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                      {keyLesson.lessons.length} lesson{keyLesson.lessons.length !== 1 ? "s" : ""}:
                    </p>
                    <ul className="space-y-1">
                      {keyLesson.lessons.slice(0, 2).map((lesson, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex gap-2"
                        >
                          <span className="text-primary-500 font-semibold flex-shrink-0">
                            {lesson.order}.
                          </span>
                          <span className="line-clamp-1">{lesson.text}</span>
                        </li>
                      ))}
                      {keyLesson.lessons.length > 2 && (
                        <li className="text-xs text-gray-400 italic">
                          +{keyLesson.lessons.length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border mt-4">
                    <span className="text-xs text-gray-400">
                      Pub: {formatDate(keyLesson.publishDate)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        keyLesson.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {keyLesson.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages} ({total} key lessons)
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
          setEditingKeyLesson(null);
        }}
        title={editingKeyLesson ? "Edit Key Lesson" : "Add New Key Lesson"}
        size="xl"
      >
        <KeyLessonForm
          initialData={editingKeyLesson || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingKeyLesson}
        onClose={() => setViewingKeyLesson(null)}
        title="Key Lesson Details"
        size="lg"
      >
        {viewingKeyLesson && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Day ID</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {viewingKeyLesson.dayId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Publish Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(viewingKeyLesson.publishDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Audience</p>
                <span className={`badge ${getAgeGroupColor(viewingKeyLesson.audience)}`}>
                  {getAgeGroupLabel(viewingKeyLesson.audience)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    viewingKeyLesson.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {viewingKeyLesson.isActive ? "Active" : "Draft"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bible Reading</p>
              <p className="font-medium text-primary-600 dark:text-primary-400">
                {viewingKeyLesson.bibleReading}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Key Lessons ({viewingKeyLesson.lessons.length})
              </p>
              <ul className="space-y-3">
                {viewingKeyLesson.lessons.map((lesson, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-500 text-white rounded-full text-xs font-semibold">
                      {lesson.order}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {lesson.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
              <Button
                variant="secondary"
                onClick={() => setViewingKeyLesson(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingKeyLesson(null);
                  openEditModal(viewingKeyLesson);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingKeyLesson}
        onClose={() => setDeletingKeyLesson(null)}
        onConfirm={handleDelete}
        title="Delete Key Lesson"
        message={
          <>
            Are you sure you want to delete the key lesson for{" "}
            <strong>{deletingKeyLesson?.bibleReading}</strong> (Day{" "}
            {deletingKeyLesson?.dayId})? This action cannot be undone.
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
