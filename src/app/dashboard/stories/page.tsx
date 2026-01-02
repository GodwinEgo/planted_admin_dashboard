"use client";

import { StoryDetails } from "@/components/details/StoryDetails";
import { StoryForm } from "@/components/forms/StoryForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { Story } from "@/lib/api";
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

export default function StoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [deletingStory, setDeletingStory] = useState<Story | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getStories({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
      });
      if (response.data) {
        setStories(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAgeGroup]);

  const handleDelete = async () => {
    if (!deletingStory) return;

    setIsDeleting(true);
    try {
      await api.deleteStory(deletingStory.id);
      setDeletingStory(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Story deleted successfully.",
        variant: "success",
      });
      fetchStories();
    } catch (error) {
      console.error("Failed to delete story:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete story. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<Story>) => {
    setIsSubmitting(true);
    try {
      if (selectedStory && !isPreviewOpen) {
        await api.updateStory(selectedStory.id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Story updated successfully!",
          variant: "success",
        });
      } else {
        await api.createStory(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Story created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setSelectedStory(null);
      fetchStories();
    } catch (error) {
      console.error("Failed to save story:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save story. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedStory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (story: Story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const openPreviewModal = (story: Story) => {
    setSelectedStory(story);
    setIsPreviewOpen(true);
  };

  if (isLoading && stories.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage Bible stories and content ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Story
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
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
      {stories.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No stories found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first story"
            }
            icon={<BookText className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Story
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="card group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full"
              >
                {story.imageUrl ? (
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-40 w-full object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center rounded-t-2xl">
                    <span className="text-4xl">{story.emoji || "📖"}</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`badge ${getAgeGroupColor(
                        story.audience || ""
                      )}`}
                    >
                      {getAgeGroupLabel(story.audience || "")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openPreviewModal(story)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(story)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStory(story)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                    {story.description || story.content?.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(story.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        story.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {story.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages} ({total} stories)
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
          setSelectedStory(null);
        }}
        title={selectedStory ? "Edit Story" : "Add New Story"}
        size="xl"
      >
        <StoryForm
          initialData={selectedStory || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedStory(null);
        }}
        title="Story Preview"
        size="xl"
      >
        {selectedStory && <StoryDetails story={selectedStory} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStory}
        onClose={() => setDeletingStory(null)}
        onConfirm={handleDelete}
        title="Delete Story"
        message={
          <>
            Are you sure you want to delete "
            <strong>{deletingStory?.title}</strong>"? This action cannot be
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
