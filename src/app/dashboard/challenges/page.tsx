"use client";

import { ChallengeForm } from "@/components/forms/ChallengeForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { Challenge } from "@/lib/api";
import { getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Target,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ChallengesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null
  );
  const [deletingChallenge, setDeletingChallenge] = useState<Challenge | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getChallenges({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
      if (response.data) {
        setChallenges(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedStatus]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus]);

  const handleDelete = async () => {
    if (!deletingChallenge) return;

    setIsDeleting(true);
    try {
      await api.deleteChallenge(deletingChallenge.id);
      setDeletingChallenge(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Challenge deleted successfully.",
        variant: "success",
      });
      fetchChallenges();
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete challenge. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<Challenge>) => {
    setIsSubmitting(true);
    try {
      if (editingChallenge) {
        await api.updateChallenge(editingChallenge.id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Challenge updated successfully!",
          variant: "success",
        });
      } else {
        await api.createChallenge(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Challenge created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingChallenge(null);
      fetchChallenges();
    } catch (error) {
      console.error("Failed to save challenge:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save challenge. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingChallenge(null);
    setIsModalOpen(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsModalOpen(true);
  };

  if (isLoading && challenges.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Challenges
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage daily and weekly faith challenges ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Challenge
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "ACTIVE", "INACTIVE", "SCHEDULED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 uppercase ${
                selectedStatus === status
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {challenges.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No challenges found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first challenge"
            }
            icon={<Target className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Challenge
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="card group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-2xl">
                      {challenge.icon || "🎯"}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          /* TODO: View */
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(challenge)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingChallenge(challenge)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {challenge.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold">
                        Type
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {challenge.type}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold">
                        Reward
                      </span>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {challenge.rewardStars} Stars
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span
                      className={`badge ${getAgeGroupColor(
                        challenge.audience || ""
                      )}`}
                    >
                      {getAgeGroupLabel(challenge.audience || "")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        challenge.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {challenge.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages} ({total} challenges)
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
          setEditingChallenge(null);
        }}
        title={editingChallenge ? "Edit Challenge" : "Add New Challenge"}
        size="xl"
      >
        <ChallengeForm
          initialData={editingChallenge || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingChallenge}
        onClose={() => setDeletingChallenge(null)}
        onConfirm={handleDelete}
        title="Delete Challenge"
        message={
          <>
            Are you sure you want to delete "
            <strong>{deletingChallenge?.title}</strong>"? This action cannot be
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
