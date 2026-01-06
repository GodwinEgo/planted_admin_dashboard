"use client";

import { QuizForm } from "@/components/forms/QuizForm";
import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  PageLoader,
} from "@/components/ui";
import api, { Quiz } from "@/lib/api";
import { formatDate, getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  HelpCircle,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function QuizzesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getQuizzes({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
      });
      if (response.data) {
        setQuizzes(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAgeGroup]);

  const handleDelete = async () => {
    if (!deletingQuiz) return;

    setIsDeleting(true);
    try {
      await api.deleteQuiz(deletingQuiz.id);
      setDeletingQuiz(null);
      setAlertModal({
        isOpen: true,
        title: "Success",
        message: "Quiz deleted successfully.",
        variant: "success",
      });
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete quiz. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<Quiz>) => {
    setIsSubmitting(true);
    try {
      if (editingQuiz) {
        await api.updateQuiz(editingQuiz.id, data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Quiz updated successfully!",
          variant: "success",
        });
      } else {
        await api.createQuiz(data);
        setAlertModal({
          isOpen: true,
          title: "Success",
          message: "Quiz created successfully!",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to save quiz:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save quiz. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingQuiz(null);
    setIsModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsModalOpen(true);
  };

  if (isLoading && quizzes.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quizzes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage quiz content and questions ({total} total)
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={openCreateModal}
        >
          Add Quiz
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
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
      {quizzes.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No quizzes found"
            description={
              searchQuery
                ? "Try adjusting your search"
                : "Create your first quiz"
            }
            icon={<HelpCircle className="w-12 h-12" />}
            action={
              <Button
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                Add Quiz
              </Button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Day ID</th>
                  <th>Audience</th>
                  <th>Questions</th>
                  <th>Passing Score</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {quiz.title}
                        </p>
                        {quiz.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {quiz.dayId || "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getAgeGroupColor(
                          quiz.audience || ""
                        )}`}
                      >
                        {getAgeGroupLabel(quiz.audience || "")}
                      </span>
                    </td>
                    <td className="text-gray-600 dark:text-gray-400">
                      {quiz.questions?.length || 0} questions
                    </td>
                    <td className="text-gray-600 dark:text-gray-400">
                      {quiz.passingScore || 70}%
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                          title="View"
                          onClick={() => setViewingQuiz(quiz)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                          title="Edit"
                          onClick={() => openEditModal(quiz)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingQuiz(quiz)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
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
              Page {currentPage} of {totalPages} ({total} quizzes)
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuiz(null);
        }}
        title={editingQuiz ? "Edit Quiz" : "Add New Quiz"}
        size="xl"
      >
        <QuizForm
          initialData={editingQuiz || undefined}
          onSubmit={handleCreateOrUpdate}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* View Quiz Modal */}
      <Modal
        isOpen={!!viewingQuiz}
        onClose={() => setViewingQuiz(null)}
        title="Quiz Details"
        size="xl"
      >
        {viewingQuiz && (
          <div className="space-y-6">
            {/* Quiz Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Day ID</p>
                <p className="font-mono font-medium text-gray-900 dark:text-white">
                  {viewingQuiz.dayId || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Publish Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(viewingQuiz.publishDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Audience</p>
                <span className={`badge ${getAgeGroupColor(viewingQuiz.audience || "")}`}>
                  {getAgeGroupLabel(viewingQuiz.audience || "")}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    viewingQuiz.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {viewingQuiz.isActive ? "Active" : "Draft"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {viewingQuiz.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Passing Score</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {viewingQuiz.passingScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Points</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {viewingQuiz.totalPoints} pts
                </p>
              </div>
            </div>

            {viewingQuiz.description && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {viewingQuiz.description}
                </p>
              </div>
            )}

            {/* Questions */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Questions ({viewingQuiz.questions?.length || 0})
              </p>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {viewingQuiz.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary-500 text-white rounded-full text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-dark-border rounded">
                            {q.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {q.points} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="ml-10 space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 text-sm p-2 rounded ${
                              opt === q.correctAnswer
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {opt === q.correctAnswer ? (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="ml-10 mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
              <Button
                variant="secondary"
                onClick={() => setViewingQuiz(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingQuiz(null);
                  openEditModal(viewingQuiz);
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
        isOpen={!!deletingQuiz}
        onClose={() => setDeletingQuiz(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message={
          <>
            Are you sure you want to delete "
            <strong>{deletingQuiz?.title}</strong>"? This action cannot be
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
