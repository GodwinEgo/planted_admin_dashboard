"use client";

import {
  AlertModal,
  Button,
  ConfirmModal,
  EmptyState,
  PageLoader,
} from "@/components/ui";
import api, {
  type DayRelationship,
  type StagedItem,
  type StagedUpload,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type SheetName =
  | "memoryVerses"
  | "keyLessons"
  | "quizzes_5_8"
  | "quizzes_9_12"
  | "childrenDevotionals"
  | "adultDevotionals";

const SHEET_DISPLAY_NAMES: Record<SheetName, string> = {
  memoryVerses: "Memory Verses",
  keyLessons: "Key Lessons",
  quizzes_5_8: "Quizzes (5-8)",
  quizzes_9_12: "Quizzes (9-12)",
  childrenDevotionals: "Children Devotionals",
  adultDevotionals: "Adult Devotionals",
};

export default function StagedUploadsPage() {
  // Staged uploads list
  const [stagedUploads, setStagedUploads] = useState<StagedUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected upload for detail view
  const [selectedUpload, setSelectedUpload] = useState<StagedUpload | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetName>("memoryVerses");

  // Sheet data
  const [sheetItems, setSheetItems] = useState<StagedItem[]>([]);
  const [sheetPage, setSheetPage] = useState(1);
  const [sheetTotalPages, setSheetTotalPages] = useState(1);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  // Actions
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [deletingUpload, setDeletingUpload] = useState<StagedUpload | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  // Load staged uploads
  const loadStagedUploads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getStagedUploads({ limit: 100 });
      // API returns { status, data: StagedUpload[] } - data is directly the array
      const uploads = Array.isArray(response.data) ? response.data : [];
      setStagedUploads(uploads);
    } catch (error) {
      console.error("Failed to load staged uploads:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStagedUploads();
  }, [loadStagedUploads]);

  // Load sheet data when selected upload or sheet changes
  useEffect(() => {
    if (selectedUpload) {
      loadSheetData(selectedUpload._id, activeSheet);
    }
  }, [selectedUpload, activeSheet, sheetPage]);

  const loadSheetData = async (uploadId: string, sheet: SheetName) => {
    setIsLoadingSheet(true);
    try {
      const response = await api.getStagedSheet(uploadId, sheet, {
        page: sheetPage,
        limit: 20,
      });
      if (response.data) {
        setSheetItems(response.data.items || []);
        setSheetTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load sheet data:", error);
      setSheetItems([]);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleApproveAll = async () => {
    if (!selectedUpload) return;

    setIsApproving(true);
    setShowApproveModal(false);

    try {
      const response = await api.approveItems(selectedUpload._id, { mode: "bulk" });

      if (response.data) {
        setAlertModal({
          isOpen: true,
          title: "Approval Complete!",
          message: `${response.data.approved} items approved, ${response.data.committed} committed to database.${
            response.data.errors.length > 0
              ? ` ${response.data.errors.length} errors occurred.`
              : ""
          }`,
          variant: response.data.errors.length > 0 ? "error" : "success",
        });

        await loadStagedUploads();
        // Refresh selected upload
        const refreshed = await api.getStagedUpload(selectedUpload._id);
        if (refreshed.data) {
          setSelectedUpload(refreshed.data as unknown as StagedUpload);
        }
        loadSheetData(selectedUpload._id, activeSheet);
      }
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        title: "Approval Failed",
        message: error.message || "Failed to approve items",
        variant: "error",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectAll = async () => {
    if (!selectedUpload) return;

    setIsRejecting(true);
    setShowRejectModal(false);

    try {
      const response = await api.rejectItems(selectedUpload._id, { mode: "bulk" });

      if (response.data) {
        setAlertModal({
          isOpen: true,
          title: "Rejection Complete",
          message: `${response.data.rejected} items rejected.`,
          variant: "success",
        });

        await loadStagedUploads();
        const refreshed = await api.getStagedUpload(selectedUpload._id);
        if (refreshed.data) {
          setSelectedUpload(refreshed.data as unknown as StagedUpload);
        }
        loadSheetData(selectedUpload._id, activeSheet);
      }
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        title: "Rejection Failed",
        message: error.message || "Failed to reject items",
        variant: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDeleteUpload = async () => {
    if (!deletingUpload) return;

    try {
      await api.deleteStagedUpload(deletingUpload._id);

      setAlertModal({
        isOpen: true,
        title: "Deleted",
        message: "Staged upload has been deleted.",
        variant: "success",
      });

      if (selectedUpload?._id === deletingUpload._id) {
        setSelectedUpload(null);
      }
      setDeletingUpload(null);
      await loadStagedUploads();
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        title: "Delete Failed",
        message: error.message || "Failed to delete upload",
        variant: "error",
      });
    }
  };

  const handleItemStatusChange = async (
    rowIndex: number,
    status: "approved" | "rejected"
  ) => {
    if (!selectedUpload) return;

    try {
      await api.updateStagedItemStatus(selectedUpload._id, {
        sheet: activeSheet,
        rowIndex,
        status,
      });

      // Refresh data
      await loadSheetData(selectedUpload._id, activeSheet);
      const refreshed = await api.getStagedUpload(selectedUpload._id);
      if (refreshed.data) {
        setSelectedUpload(refreshed.data as unknown as StagedUpload);
      }
      await loadStagedUploads();
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        title: "Update Failed",
        message: error.message || "Failed to update item status",
        variant: "error",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getUploadStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PARTIALLY_APPROVED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "FULLY_APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const filteredUploads = stagedUploads.filter(
    (upload) =>
      upload.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <PageLoader />;
  }

  // Detail view when an upload is selected
  if (selectedUpload) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedUpload(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedUpload.fileName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded {formatDate(selectedUpload.uploadedAt)} •{" "}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUploadStatusBadge(selectedUpload.status)}`}>
                  {selectedUpload.status.replace("_", " ")}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                loadStagedUploads();
                loadSheetData(selectedUpload._id, activeSheet);
              }}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            {selectedUpload.summary.pendingApproval > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowApproveModal(true)}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  isLoading={isApproving}
                >
                  Approve All ({selectedUpload.summary.pendingApproval})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  isLoading={isRejecting}
                  className="text-red-600"
                >
                  Reject All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {selectedUpload.summary.pendingApproval}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {selectedUpload.summary.approved}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {selectedUpload.summary.rejected}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">
              {selectedUpload.summary.totalItems}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>

        {/* Sheet Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(SHEET_DISPLAY_NAMES) as SheetName[]).map((sheet) => {
            const sheetData = selectedUpload.sheets[sheet];
            return (
              <button
                key={sheet}
                onClick={() => {
                  setActiveSheet(sheet);
                  setSheetPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeSheet === sheet
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-hover"
                }`}
              >
                {SHEET_DISPLAY_NAMES[sheet]}
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-dark-border">
                  {sheetData?.totalItems || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sheet Table */}
        <div className="card overflow-hidden">
          {isLoadingSheet ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
          ) : sheetItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No items in this sheet.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-hover">
                    <tr>
                      <th className="w-16">#</th>
                      <th className="w-28">Day ID</th>
                      <th className="w-32">Date</th>
                      <th>Content Preview</th>
                      <th className="w-28">Status</th>
                      <th className="w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheetItems.map((item) => {
                      // Get a content preview based on sheet type
                      const data = item.data as Record<string, unknown>;
                      let preview = "";
                      if (activeSheet === "memoryVerses") {
                        preview = `${data.reference || ""} - ${String(data.verseText || "").slice(0, 50)}...`;
                      } else if (activeSheet === "keyLessons") {
                        const lessons = data.lessons as Array<{ text: string }> | undefined;
                        preview = lessons?.map((l) => l.text).join("; ").slice(0, 80) + "..." || "";
                      } else if (activeSheet.startsWith("quizzes")) {
                        const questions = data.questions as Array<{ question: string }> | undefined;
                        preview = `${questions?.length || 0} questions`;
                      } else {
                        preview = String(data.title || data.content || "").slice(0, 80) + "...";
                      }

                      return (
                        <tr key={item.index} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                          <td className="text-gray-500">{item.index + 1}</td>
                          <td className="font-mono text-xs">{item.dayId}</td>
                          <td className="text-sm">
                            {item.date ? formatDate(item.date) : "—"}
                          </td>
                          <td className="max-w-md truncate text-gray-600 dark:text-gray-400">
                            {preview}
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            {item.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleItemStatusChange(item.index, "approved")}
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleItemStatusChange(item.index, "rejected")}
                                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sheetTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-dark-border">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {sheetPage} of {sheetTotalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={sheetPage === 1}
                      onClick={() => setSheetPage((p) => p - 1)}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={sheetPage === sheetTotalPages}
                      onClick={() => setSheetPage((p) => p + 1)}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApproveAll}
          title="Approve All Pending Items"
          message={
            <>
              This will approve all <strong>{selectedUpload.summary.pendingApproval}</strong> pending
              items and commit them to the database. This action cannot be undone.
            </>
          }
          confirmText="Approve All"
          variant="success"
        />

        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectAll}
          title="Reject All Pending Items"
          message={
            <>
              This will reject all <strong>{selectedUpload.summary.pendingApproval}</strong> pending
              items. They will not be committed to the database.
            </>
          }
          confirmText="Reject All"
          variant="danger"
        />

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

  // List view
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staged Uploads
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review and approve uploaded content before publishing ({stagedUploads.length} uploads)
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={loadStagedUploads}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by filename or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      {filteredUploads.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No staged uploads"
            description={searchQuery ? "Try adjusting your search" : "Upload an Excel file from the Bulk Upload page"}
            icon={<FileSpreadsheet className="w-12 h-12" />}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50 dark:bg-dark-hover">
                <tr>
                  <th>File Name</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th className="text-center">Pending</th>
                  <th className="text-center">Approved</th>
                  <th className="text-center">Rejected</th>
                  <th className="text-center">Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUploads.map((upload) => (
                  <tr
                    key={upload._id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer"
                    onClick={() => setSelectedUpload(upload)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {upload.fileName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(upload.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(upload.uploadedAt)}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getUploadStatusBadge(
                          upload.status
                        )}`}
                      >
                        {upload.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {upload.summary.pendingApproval}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {upload.summary.approved}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {upload.summary.rejected}
                      </span>
                    </td>
                    <td className="text-center font-medium">
                      {upload.summary.totalItems}
                    </td>
                    <td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUpload(upload)}
                          className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {upload.status !== "FULLY_APPROVED" && (
                          <button
                            onClick={() => setDeletingUpload(upload)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUpload}
        onClose={() => setDeletingUpload(null)}
        onConfirm={handleDeleteUpload}
        title="Delete Staged Upload"
        message={
          <>
            Are you sure you want to delete <strong>{deletingUpload?.fileName}</strong>?
            This will permanently remove all staged data. This action cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
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
