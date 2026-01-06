"use client";

import { AlertModal, Button, ConfirmModal } from "@/components/ui";
import api, {
  type DayRelationship,
  type StagedItem,
  type StagedUpload,
} from "@/lib/api";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";

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
  quizzes_5_8: "Quizzes (Ages 5-8)",
  quizzes_9_12: "Quizzes (Ages 9-12)",
  childrenDevotionals: "Children Devotionals",
  adultDevotionals: "Adult Devotionals",
};

export default function BulkUploadPage() {
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Staged uploads list
  const [stagedUploads, setStagedUploads] = useState<StagedUpload[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);

  // Selected upload for review
  const [selectedUpload, setSelectedUpload] = useState<StagedUpload | null>(null);
  const [activeTab, setActiveTab] = useState<SheetName | "relationships">("memoryVerses");

  // Sheet data with pagination
  const [sheetItems, setSheetItems] = useState<StagedItem[]>([]);
  const [sheetPage, setSheetPage] = useState(1);
  const [sheetTotalPages, setSheetTotalPages] = useState(1);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  // Relationships
  const [relationships, setRelationships] = useState<DayRelationship[]>([]);
  const [relationshipsPage, setRelationshipsPage] = useState(1);
  const [relationshipsTotalPages, setRelationshipsTotalPages] = useState(1);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Actions
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Modals
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  // Load staged uploads on mount
  useEffect(() => {
    loadStagedUploads();
  }, []);

  // Load sheet data when tab or upload changes
  useEffect(() => {
    if (selectedUpload && activeTab !== "relationships") {
      loadSheetData(selectedUpload._id, activeTab);
    }
  }, [selectedUpload, activeTab, sheetPage]);

  // Load relationships when tab changes
  useEffect(() => {
    if (selectedUpload && activeTab === "relationships") {
      loadRelationships(selectedUpload._id);
    }
  }, [selectedUpload, activeTab, relationshipsPage]);

  const loadStagedUploads = async () => {
    setIsLoadingUploads(true);
    try {
      const response = await api.getStagedUploads({ limit: 50 });
      setStagedUploads(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load staged uploads:", error);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  const loadSheetData = async (uploadId: string, sheet: SheetName) => {
    setIsLoadingSheet(true);
    try {
      const response = await api.getStagedSheet(uploadId, sheet, {
        page: sheetPage,
        limit: 50,
      });
      if (response.data) {
        setSheetItems(response.data.items || []);
        setSheetTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load sheet data:", error);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const loadRelationships = async (uploadId: string) => {
    setIsLoadingRelationships(true);
    try {
      const response = await api.getStagedRelationships(uploadId, {
        page: relationshipsPage,
        limit: 20,
      });
      if (response.data) {
        setRelationships(response.data.relationships || []);
        setRelationshipsTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load relationships:", error);
    } finally {
      setIsLoadingRelationships(false);
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setUploadError(null);

      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !validTypes.includes(selectedFile.type) &&
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setUploadError("Please upload an Excel file (.xlsx or .xls)");
        return;
      }

      setFile(selectedFile);
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await api.uploadExcel(file);

      if (response.data) {
        setAlertModal({
          isOpen: true,
          title: "Upload Successful!",
          message: `File "${file.name}" has been uploaded and parsed. ${response.data.summary.totalItems} items are ready for review.`,
          variant: "success",
        });

        setFile(null);
        await loadStagedUploads();

        // Auto-select the new upload
        if (response.data.uploadId) {
          const newUpload = await api.getStagedUpload(response.data.uploadId);
          if (newUpload.data) {
            setSelectedUpload(newUpload.data as unknown as StagedUpload);
          }
        }
      }
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!selectedUpload) return;

    setIsApproving(true);
    setShowConfirmApprove(false);

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
        const refreshed = await api.getStagedUpload(selectedUpload._id);
        if (refreshed.data) {
          setSelectedUpload(refreshed.data as unknown as StagedUpload);
        }
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
    setShowConfirmReject(false);

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
    if (!selectedUpload) return;

    setShowConfirmDelete(false);

    try {
      await api.deleteStagedUpload(selectedUpload._id);

      setAlertModal({
        isOpen: true,
        title: "Deleted",
        message: "Staged upload has been deleted.",
        variant: "success",
      });

      setSelectedUpload(null);
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
    sheet: SheetName,
    rowIndex: number,
    status: "approved" | "rejected"
  ) => {
    if (!selectedUpload) return;

    try {
      await api.updateStagedItemStatus(selectedUpload._id, {
        sheet,
        rowIndex,
        status,
      });

      // Refresh data
      await loadSheetData(selectedUpload._id, sheet);
      const refreshed = await api.getStagedUpload(selectedUpload._id);
      if (refreshed.data) {
        setSelectedUpload(refreshed.data as unknown as StagedUpload);
      }
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        title: "Update Failed",
        message: error.message || "Failed to update item status",
        variant: "error",
      });
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Memory Verses template
    const mvTemplate = [
      {
        DayID: "20260118",
        Date: "2026-01-18",
        BibleReading: "Matthew 1:1-25",
        "Verse Text_5_8": "For God so loved the world...",
        "Verse Text_9_12": "For God so loved the world that he gave...",
        Reference: "John 3:16",
      },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mvTemplate), "MemoryVerses");

    // Key Lessons template
    const klTemplate = [
      {
        DayID: "20260118",
        Date: "2026-01-18",
        BibleReading: "Matthew 1:1-25",
        "Lesson1_5_8": "God keeps His promises",
        "Lesson2_5_8": "Jesus is God's Son",
        "Lesson3_5_8": "God has a plan for everyone",
        "Lesson1_9_12": "God fulfills prophecy",
        "Lesson2_9_12": "Jesus came to save us",
        "Lesson3_9_12": "Trust in God's timing",
      },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(klTemplate), "KeyLessons");

    // Quiz template
    const quizTemplate = [
      {
        DayID: "20260118",
        Date: "2026-01-18",
        BibleReading: "Matthew 1:1-25",
        Q1: "Who was Jesus' earthly father?",
        Q1A: "Joseph",
        Q1B: "David",
        Q1C: "Abraham",
        Q1D: "Moses",
        Q1Answer: "A",
        Q2: "What does Emmanuel mean?",
        Q2A: "King of Kings",
        Q2B: "God with us",
        Q2C: "Prince of Peace",
        Q2D: "Savior",
        Q2Answer: "B",
      },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quizTemplate), "Q_5_8");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quizTemplate), "Q_9_12");

    // Devotional template
    const devTemplate = [
      {
        DayID: "20260118",
        Date: "2026-01-18",
        Title: "God's Promise Fulfilled",
        BibleReading: "Matthew 1:1-25",
        "Body/Story": "Long ago, God made a promise to send a Savior...",
        FaithSpeaks: "I believe God keeps His promises.",
        WordChallenge: "Share one promise of God with a friend.",
      },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(devTemplate), "Children Devotional");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(devTemplate), "Adult Devotional");

    XLSX.writeFile(wb, "planted_bulk_upload_template.xlsx");
  };

  const toggleDayExpanded = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
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

  const renderUploadsList = () => (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="font-semibold text-gray-900 dark:text-white">Staged Uploads</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click an upload to review and approve items
        </p>
      </div>

      {isLoadingUploads ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
        </div>
      ) : stagedUploads.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No staged uploads. Upload an Excel file to get started.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-96 overflow-y-auto">
          {stagedUploads.map((upload) => (
            <button
              key={upload._id}
              onClick={() => {
                setSelectedUpload(upload);
                setActiveTab("memoryVerses");
                setSheetPage(1);
              }}
              className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors ${
                selectedUpload?._id === upload._id
                  ? "bg-primary-50 dark:bg-primary-900/20"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(upload.uploadedAt).toLocaleDateString()} •{" "}
                      {upload.summary.totalItems} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      upload.status === "FULLY_APPROVED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : upload.status === "PARTIALLY_APPROVED"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : upload.status === "REJECTED"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {upload.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {upload.summary.pendingApproval}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> pending</span>
                </div>
                <div className="text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {upload.summary.approved}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> approved</span>
                </div>
                <div className="text-center">
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {upload.summary.rejected}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> rejected</span>
                </div>
                <div className="text-center">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {upload.summary.totalItems}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> total</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSheetTabs = () => {
    if (!selectedUpload) return null;

    const tabs: Array<{ key: SheetName | "relationships"; label: string; count: number }> = [
      {
        key: "memoryVerses",
        label: "Memory Verses",
        count: selectedUpload.sheets.memoryVerses.totalItems,
      },
      {
        key: "keyLessons",
        label: "Key Lessons",
        count: selectedUpload.sheets.keyLessons.totalItems,
      },
      {
        key: "quizzes_5_8",
        label: "Quizzes (5-8)",
        count: selectedUpload.sheets.quizzes_5_8.totalItems,
      },
      {
        key: "quizzes_9_12",
        label: "Quizzes (9-12)",
        count: selectedUpload.sheets.quizzes_9_12.totalItems,
      },
      {
        key: "childrenDevotionals",
        label: "Kids Devotionals",
        count: selectedUpload.sheets.childrenDevotionals.totalItems,
      },
      {
        key: "adultDevotionals",
        label: "Adult Devotionals",
        count: selectedUpload.sheets.adultDevotionals.totalItems,
      },
      {
        key: "relationships",
        label: "Day Links",
        count: selectedUpload.relationships?.length || 0,
      },
    ];

    return (
      <div className="flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSheetPage(1);
              setRelationshipsPage(1);
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-hover"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-dark-border">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderSheetContent = () => {
    if (!selectedUpload) return null;

    if (activeTab === "relationships") {
      return renderRelationships();
    }

    if (isLoadingSheet) {
      return (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
        </div>
      );
    }

    if (sheetItems.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No items in this sheet.
        </div>
      );
    }

    // Get column headers from first item's data
    const firstItem = sheetItems[0];
    const columns = firstItem ? Object.keys(firstItem.data) : [];

    return (
      <div className="overflow-x-auto">
        <table className="table text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-dark-card z-10">
            <tr>
              <th className="w-12">#</th>
              <th className="w-24">Status</th>
              <th className="w-24">Day ID</th>
              {columns.slice(0, 5).map((col) => (
                <th key={col} className="max-w-xs">
                  {col}
                </th>
              ))}
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sheetItems.map((item) => (
              <tr key={item.index} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                <td className="text-gray-500">{item.index + 1}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td className="font-mono text-xs">{item.dayId}</td>
                {columns.slice(0, 5).map((col) => (
                  <td key={col} className="max-w-xs truncate">
                    {String(item.data[col] || "—")}
                  </td>
                ))}
                <td>
                  <div className="flex items-center gap-1">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleItemStatusChange(activeTab as SheetName, item.index, "approved")
                          }
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleItemStatusChange(activeTab as SheetName, item.index, "rejected")
                          }
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={sheetPage === sheetTotalPages}
                onClick={() => setSheetPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRelationships = () => {
    if (isLoadingRelationships) {
      return (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
        </div>
      );
    }

    if (relationships.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No day relationships found.
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-dark-border">
        {relationships.map((rel) => (
          <div key={rel.dayId} className="p-4">
            <button
              onClick={() => toggleDayExpanded(rel.dayId)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                {expandedDays.has(rel.dayId) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Day {rel.dayId} • {new Date(rel.publishDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rel.bibleReading}</p>
                </div>
              </div>
              <Link2 className="w-5 h-5 text-gray-400" />
            </button>

            {expandedDays.has(rel.dayId) && (
              <div className="mt-4 ml-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(rel.items).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div
                      key={key}
                      className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {key.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Row {value.rowIndex + 1}
                        </span>
                        {getStatusBadge(value.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {relationshipsTotalPages > 1 && (
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {relationshipsPage} of {relationshipsTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={relationshipsPage === 1}
                onClick={() => setRelationshipsPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={relationshipsPage === relationshipsTotalPages}
                onClick={() => setRelationshipsPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReviewPanel = () => {
    if (!selectedUpload) {
      return (
        <div className="card p-8 text-center">
          <Eye className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Select a staged upload from the list to review
          </p>
        </div>
      );
    }

    return (
      <div className="card">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedUpload.fileName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded {new Date(selectedUpload.uploadedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadStagedUploads()}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {selectedUpload.summary.pendingApproval}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Pending</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedUpload.summary.approved}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">Approved</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {selectedUpload.summary.rejected}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">Rejected</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {selectedUpload.summary.totalItems}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-400">Total</p>
            </div>
          </div>

          {/* Parse errors */}
          {selectedUpload.parseErrors && selectedUpload.parseErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Parse Errors</p>
                  <ul className="mt-1 text-sm text-red-600 dark:text-red-300 list-disc list-inside">
                    {selectedUpload.parseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {selectedUpload.parseErrors.length > 5 && (
                      <li>...and {selectedUpload.parseErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bulk actions */}
          {selectedUpload.summary.pendingApproval > 0 && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setShowConfirmApprove(true)}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                isLoading={isApproving}
              >
                Approve All Pending ({selectedUpload.summary.pendingApproval})
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowConfirmReject(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
                isLoading={isRejecting}
                className="text-red-600"
              >
                Reject All Pending
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          {renderSheetTabs()}
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto">{renderSheetContent()}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk Upload</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload Excel files with content to review and approve before publishing
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Download className="w-5 h-5" />}
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload New File
        </h2>

        {!file ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Drop your Excel file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              or click to browse (.xlsx, .xls)
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
              Select File
            </Button>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-hover rounded-xl">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-10 h-10 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setUploadError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                leftIcon={<Upload className="w-4 h-4" />}
                isLoading={isUploading}
              >
                Upload & Parse
              </Button>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staged Uploads List */}
        <div className="lg:col-span-1">{renderUploadsList()}</div>

        {/* Review Panel */}
        <div className="lg:col-span-2">{renderReviewPanel()}</div>
      </div>

      {/* Confirm Approve Modal */}
      <ConfirmModal
        isOpen={showConfirmApprove}
        onClose={() => setShowConfirmApprove(false)}
        onConfirm={handleApproveAll}
        title="Approve All Pending Items"
        message={
          <>
            This will approve all <strong>{selectedUpload?.summary.pendingApproval}</strong> pending
            items and commit them to the database. This action cannot be undone.
          </>
        }
        confirmText="Approve All"
        variant="success"
      />

      {/* Confirm Reject Modal */}
      <ConfirmModal
        isOpen={showConfirmReject}
        onClose={() => setShowConfirmReject(false)}
        onConfirm={handleRejectAll}
        title="Reject All Pending Items"
        message={
          <>
            This will reject all <strong>{selectedUpload?.summary.pendingApproval}</strong> pending
            items. They will not be committed to the database.
          </>
        }
        confirmText="Reject All"
        variant="danger"
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteUpload}
        title="Delete Staged Upload"
        message="This will permanently delete this staged upload and all its data. This action cannot be undone."
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
