"use client";

import { AlertModal, Button, ConfirmModal, Modal } from "@/components/ui";
import api from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import * as XLSX from "xlsx";

interface ParsedDevotional {
  title: string;
  subtitle?: string;
  bibleReference: string;
  verseText: string;
  content: string;
  prayerPrompt?: string;
  reflectionQuestions: string[];
  audience: string;
  publishDate: string;
  tags: string[];
  isActive: boolean;
  // Quiz data (if provided)
  quizTitle?: string;
  quizQuestions?: {
    question: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
    options: string[];
    correctAnswer: string;
    points: number;
  }[];
}

interface UploadResult {
  success: boolean;
  devotionalId?: string;
  devotionalTitle?: string;
  quizId?: string;
  error?: string;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDevotional[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({ isOpen: false, title: "", message: "", variant: "success" });

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      // Reset state
      setParsedData([]);
      setParseError(null);
      setUploadResults([]);

      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !validTypes.includes(selectedFile.type) &&
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setParseError("Please upload an Excel file (.xlsx or .xls)");
        return;
      }

      setFile(selectedFile);
      parseExcelFile(selectedFile);
    },
    []
  );

  const parseExcelFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Get the first sheet (Devotionals)
      const devotionalsSheet = workbook.Sheets[workbook.SheetNames[0]];
      const devotionalsData = XLSX.utils.sheet_to_json(devotionalsSheet);

      // Get the second sheet (Quiz Questions) if it exists
      const quizSheet = workbook.Sheets[workbook.SheetNames[1]];
      const quizData = quizSheet
        ? XLSX.utils.sheet_to_json<{
            devotionalTitle: string;
            question: string;
            type: string;
            option1: string;
            option2: string;
            option3: string;
            option4: string;
            correctAnswer: string;
            points: number;
          }>(quizSheet)
        : [];

      // Group quiz questions by devotional title
      const quizMap = new Map<
        string,
        {
          question: string;
          type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
          options: string[];
          correctAnswer: string;
          points: number;
        }[]
      >();

      quizData.forEach((q: any) => {
        const title = q.devotionalTitle?.toString().trim();
        if (!title) return;

        if (!quizMap.has(title)) {
          quizMap.set(title, []);
        }

        // Map the type safely
        let qType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" =
          "MULTIPLE_CHOICE";
        if (q.type === "TRUE_FALSE") qType = "TRUE_FALSE";
        if (q.type === "FILL_BLANK") qType = "FILL_BLANK";

        quizMap.get(title)!.push({
          question: q.question?.toString() || "",
          type: qType,
          options: [q.option1, q.option2, q.option3, q.option4]
            .filter(Boolean)
            .map(String),
          correctAnswer: q.correctAnswer?.toString() || "",
          points: Number(q.points) || 10,
        });
      });

      // Parse devotionals
      const parsed: ParsedDevotional[] = devotionalsData.map((row: any) => {
        const title = row.title?.toString().trim() || "";
        const reflectionQs = [];

        // Parse reflection questions (columns like reflection1, reflection2, etc.)
        for (let i = 1; i <= 5; i++) {
          const q = row[`reflection${i}`] || row[`reflectionQuestion${i}`];
          if (q) reflectionQs.push(q.toString().trim());
        }

        // Parse tags (comma-separated)
        const tags = row.tags
          ? row.tags
              .toString()
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [];

        return {
          title,
          subtitle: row.subtitle?.toString().trim() || undefined,
          bibleReference: row.bibleReference?.toString().trim() || "",
          verseText: row.verseText?.toString().trim() || "",
          content: row.content?.toString().trim() || "",
          prayerPrompt: row.prayerPrompt?.toString().trim() || undefined,
          reflectionQuestions: reflectionQs,
          audience: row.audience?.toString().toUpperCase() || "SPROUT_EXPLORER",
          publishDate:
            parseExcelDate(row.publishDate) ||
            new Date().toISOString().split("T")[0],
          tags,
          isActive: row.isActive !== false && row.isActive !== "false",
          quizTitle: quizMap.has(title) ? `${title} Quiz` : undefined,
          quizQuestions: quizMap.get(title),
        };
      });

      // Validate parsed data
      const errors: string[] = [];
      parsed.forEach((d, i) => {
        if (!d.title) errors.push(`Row ${i + 2}: Missing title`);
        if (!d.bibleReference)
          errors.push(`Row ${i + 2}: Missing Bible reference`);
        if (!d.verseText) errors.push(`Row ${i + 2}: Missing verse text`);
        if (!d.content) errors.push(`Row ${i + 2}: Missing content`);
      });

      if (errors.length > 0) {
        setParseError(
          `Validation errors:\n${errors.slice(0, 10).join("\n")}${
            errors.length > 10 ? `\n...and ${errors.length - 10} more` : ""
          }`
        );
        return;
      }

      setParsedData(parsed);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setParseError(
        "Failed to parse Excel file. Please check the file format."
      );
    }
  };

  const parseExcelDate = (value: any): string | null => {
    if (!value) return null;

    // If it's already a string date
    if (typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
      return value;
    }

    // If it's an Excel serial date number
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
        date.d
      ).padStart(2, "0")}`;
    }

    return null;
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    setShowConfirmModal(false);
    const results: UploadResult[] = [];

    for (const devotional of parsedData) {
      try {
        // Create devotional
        const devResponse = await api.createDevotional({
          title: devotional.title,
          subtitle: devotional.subtitle,
          bibleReference: devotional.bibleReference,
          verseText: devotional.verseText,
          content: devotional.content,
          prayerPrompt: devotional.prayerPrompt,
          reflectionQuestions: devotional.reflectionQuestions,
          audience: devotional.audience as any,
          publishDate: devotional.publishDate,
          tags: devotional.tags,
          isActive: devotional.isActive,
        });

        const devotionalId = devResponse.data?.data?.id;
        let quizId: string | undefined;

        // Create quiz if questions exist
        if (
          devotional.quizQuestions &&
          devotional.quizQuestions.length > 0 &&
          devotionalId
        ) {
          try {
            const quizResponse = await api.createQuiz({
              title: devotional.quizTitle || `${devotional.title} Quiz`,
              description: `Quiz for: ${devotional.title}`,
              devotionalId: devotionalId,
              audience: devotional.audience as any,
              questions: devotional.quizQuestions,
              passingScore: 70,
              publishDate: devotional.publishDate,
              isActive: devotional.isActive,
            });
            quizId = quizResponse.data?.quiz?.id;
          } catch (quizError) {
            console.error("Error creating quiz:", quizError);
          }
        }

        results.push({
          success: true,
          devotionalId,
          devotionalTitle: devotional.title,
          quizId,
        });
      } catch (error: any) {
        results.push({
          success: false,
          devotionalTitle: devotional.title,
          error: error.message || "Failed to create",
        });
      }
    }

    setUploadResults(results);
    setIsUploading(false);
    setShowResultsModal(true);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (failCount === 0) {
      setAlertModal({
        isOpen: true,
        title: "Upload Complete!",
        message: `Successfully created ${successCount} devotionals with their quizzes.`,
        variant: "success",
      });
    } else {
      setAlertModal({
        isOpen: true,
        title: "Upload Completed with Errors",
        message: `Created ${successCount} devotionals. Failed: ${failCount}`,
        variant: "error",
      });
    }
  };

  const downloadTemplate = () => {
    // Create template workbook
    const wb = XLSX.utils.book_new();

    // Devotionals sheet
    const devotionalsTemplate = [
      {
        title: "The Good Shepherd",
        subtitle: "Jesus cares for His sheep",
        bibleReference: "John 10:11-14",
        verseText:
          "I am the good shepherd. The good shepherd lays down his life for the sheep.",
        content:
          "Jesus told a story about a shepherd who loves his sheep very much. The shepherd knows each sheep by name and protects them from danger. Jesus said He is like that shepherd - He knows us and loves us!",
        prayerPrompt:
          "Thank Jesus for being your Good Shepherd who loves and protects you.",
        reflection1: "How does Jesus show He cares for you?",
        reflection2:
          "What does it mean to follow Jesus like sheep follow a shepherd?",
        audience: "SPROUT_EXPLORER",
        publishDate: "2026-01-15",
        tags: "Jesus, Love, Protection",
        isActive: true,
      },
    ];

    const devotionalsWs = XLSX.utils.json_to_sheet(devotionalsTemplate);
    XLSX.utils.book_append_sheet(wb, devotionalsWs, "Devotionals");

    // Quiz Questions sheet
    const quizTemplate = [
      {
        devotionalTitle: "The Good Shepherd",
        question: "Who is the Good Shepherd?",
        type: "MULTIPLE_CHOICE",
        option1: "David",
        option2: "Moses",
        option3: "Jesus",
        option4: "Abraham",
        correctAnswer: "Jesus",
        points: 10,
      },
      {
        devotionalTitle: "The Good Shepherd",
        question: "The shepherd knows each sheep by name.",
        type: "TRUE_FALSE",
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correctAnswer: "True",
        points: 10,
      },
    ];

    const quizWs = XLSX.utils.json_to_sheet(quizTemplate);
    XLSX.utils.book_append_sheet(wb, quizWs, "Quiz Questions");

    // Download
    XLSX.writeFile(wb, "devotionals_quizzes_template.xlsx");
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setParseError(null);
    setUploadResults([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bulk Upload
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload devotionals and quizzes from an Excel file
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

      {/* Instructions Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Download Template
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get the Excel template with the correct column structure
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Fill in Your Data
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add devotionals in Sheet 1, quiz questions in Sheet 2
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Upload & Create
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload the file and all content will be created automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card p-8">
        {!file ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl p-12 cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop your Excel file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or click to browse (.xlsx, .xls)
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="secondary"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Select File
            </Button>
          </label>
        ) : (
          <div>
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-hover rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-10 h-10 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">
                      Error Parsing File
                    </p>
                    <pre className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap mt-1">
                      {parseError}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Parsed Data Preview */}
            {parsedData.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found{" "}
                    <strong className="text-primary-600">
                      {parsedData.length}
                    </strong>{" "}
                    devotionals
                    {parsedData.filter((d) => d.quizQuestions).length > 0 && (
                      <>
                        {" "}
                        with{" "}
                        <strong className="text-primary-600">
                          {parsedData.filter((d) => d.quizQuestions).length}
                        </strong>{" "}
                        quizzes
                      </>
                    )}
                  </p>
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 dark:border-dark-border rounded-xl">
                  <table className="table text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-dark-card">
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Bible Reference</th>
                        <th>Audience</th>
                        <th>Publish Date</th>
                        <th>Quiz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((d, i) => (
                        <tr key={i}>
                          <td className="text-gray-500">{i + 1}</td>
                          <td className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                            {d.title}
                          </td>
                          <td className="text-gray-600 dark:text-gray-400">
                            {d.bibleReference}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                d.audience === "SPROUT_EXPLORER"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}
                            >
                              {d.audience === "SPROUT_EXPLORER"
                                ? "Kids"
                                : "Teens"}
                            </span>
                          </td>
                          <td className="text-gray-600 dark:text-gray-400">
                            {d.publishDate}
                          </td>
                          <td>
                            {d.quizQuestions ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                {d.quizQuestions.length} Qs
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="secondary" onClick={clearFile}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    leftIcon={<Upload className="w-5 h-5" />}
                    isLoading={isUploading}
                  >
                    Upload {parsedData.length} Devotionals
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Uploading Progress */}
      {isUploading && (
        <div className="card p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Uploading content...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please wait while we create your devotionals and quizzes
          </p>
        </div>
      )}

      {/* Confirm Upload Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleUpload}
        title="Confirm Upload"
        message={
          <>
            You are about to create <strong>{parsedData.length}</strong>{" "}
            devotionals
            {parsedData.filter((d) => d.quizQuestions).length > 0 && (
              <>
                {" "}
                and{" "}
                <strong>
                  {parsedData.filter((d) => d.quizQuestions).length}
                </strong>{" "}
                linked quizzes
              </>
            )}
            . This action cannot be easily undone.
          </>
        }
        confirmText="Upload All"
        variant="success"
      />

      {/* Results Modal */}
      <Modal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title="Upload Results"
        size="lg"
      >
        <div className="max-h-96 overflow-y-auto">
          <table className="table text-sm">
            <thead className="sticky top-0 bg-white dark:bg-dark-bg">
              <tr>
                <th>Status</th>
                <th>Devotional</th>
                <th>Quiz</th>
              </tr>
            </thead>
            <tbody>
              {uploadResults.map((result, i) => (
                <tr key={i}>
                  <td>
                    {result.success ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs truncate">
                    {result.devotionalTitle}
                  </td>
                  <td>
                    {result.quizId ? (
                      <span className="text-green-600">Created</span>
                    ) : result.success ? (
                      <span className="text-gray-400">No quiz</span>
                    ) : (
                      <span className="text-red-600 text-sm">
                        {result.error}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <Button
            onClick={() => {
              setShowResultsModal(false);
              clearFile();
            }}
          >
            Done
          </Button>
        </div>
      </Modal>

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
