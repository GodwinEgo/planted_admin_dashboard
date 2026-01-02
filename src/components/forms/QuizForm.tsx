"use client";

import { Button } from "@/components/ui";
import api, { Devotional, Quiz, QuizQuestion } from "@/lib/api";
import { CheckCircle, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizFormProps {
  initialData?: Partial<Quiz>;
  onSubmit: (data: Partial<Quiz>) => Promise<void>;
  isLoading?: boolean;
}

export function QuizForm({ initialData, onSubmit, isLoading }: QuizFormProps) {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    devotionalId: "",
    audience: "SPROUT_EXPLORER",
    questions: [],
    passingScore: 70,
    timeLimit: null,
    publishDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  // Devotionals list for dropdown
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loadingDevotionals, setLoadingDevotionals] = useState(false);

  // Fetch devotionals on mount and when audience changes
  useEffect(() => {
    const fetchDevotionals = async () => {
      setLoadingDevotionals(true);
      try {
        const response = await api.getDevotionals({
          limit: 100,
          ageGroup: formData.audience,
        });
        if (response.data) {
          setDevotionals(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch devotionals:", error);
      } finally {
        setLoadingDevotionals(false);
      }
    };

    fetchDevotionals();
  }, [formData.audience]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        publishDate: initialData.publishDate
          ? new Date(initialData.publishDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        questions: initialData.questions || [],
        devotionalId: initialData.devotionalId || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: "",
      type: "MULTIPLE_CHOICE",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 10,
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }));
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...(formData.questions || [])];
    newQuestions.splice(index, 1);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof QuizQuestion,
    value: any
  ) => {
    const newQuestions = [...(formData.questions || [])];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...(formData.questions || [])];
    const newOptions = [...(newQuestions[qIndex].options || [])];
    newOptions[oIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPoints =
      formData.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0;
    await onSubmit({
      ...formData,
      totalPoints,
      // Only include devotionalId if selected
      devotionalId: formData.devotionalId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quiz Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. David and Goliath"
            className="input"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="What is this quiz about?"
            className="input min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Audience
          </label>
          <select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="SPROUT_EXPLORER">Sprout Explorers (Ages 3-9)</option>
            <option value="TRAILBLAZER_TEEN">
              Trailblazer Teens (Ages 10-17)
            </option>
          </select>
        </div>

        {/* Linked Devotional - NEW FIELD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Linked Devotional
            <span className="text-xs text-gray-400 ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <select
              name="devotionalId"
              value={formData.devotionalId || ""}
              onChange={handleChange}
              className="input"
              disabled={loadingDevotionals}
            >
              <option value="">-- No linked devotional --</option>
              {devotionals.map((devotional) => (
                <option key={devotional.id} value={devotional.id}>
                  {devotional.title} ({devotional.bibleReference})
                </option>
              ))}
            </select>
            {loadingDevotionals && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Link this quiz to a devotional. The quiz will appear after the child
            completes the devotional.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Publish Date
          </label>
          <input
            type="date"
            name="publishDate"
            value={formData.publishDate}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            name="passingScore"
            value={formData.passingScore}
            onChange={handleChange}
            min="0"
            max="100"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time Limit (Seconds, Optional)
          </label>
          <input
            type="number"
            name="timeLimit"
            value={formData.timeLimit || ""}
            onChange={handleChange}
            placeholder="e.g. 300"
            className="input"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Active (visible to users)
          </label>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Questions ({formData.questions?.length || 0})
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addQuestion}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Question
          </Button>
        </div>

        {formData.questions?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No questions yet. Click "Add Question" to get started.</p>
          </div>
        )}

        {formData.questions?.map((question, qIndex) => (
          <div
            key={qIndex}
            className="bg-gray-50 dark:bg-dark-hover/50 rounded-xl p-5 border border-gray-100 dark:border-dark-border"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 text-gray-400 pt-2">
                <GripVertical className="w-5 h-5" />
                <span className="text-sm font-bold">{qIndex + 1}</span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "question", e.target.value)
                      }
                      placeholder="Enter question..."
                      className="input"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "type", e.target.value)
                      }
                      className="input"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="FILL_BLANK">Fill in the Blank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "points",
                          Number(e.target.value)
                        )
                      }
                      min="1"
                      className="input"
                      required
                    />
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {question.type === "MULTIPLE_CHOICE" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Options (click to set as correct answer)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="relative">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className={`input pr-10 ${
                              question.correctAnswer === option && option
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                option
                              )
                            }
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${
                              question.correctAnswer === option && option
                                ? "text-green-500"
                                : "text-gray-300 hover:text-green-500"
                            }`}
                            title="Set as correct answer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* True/False */}
                {question.type === "TRUE_FALSE" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Correct Answer
                    </label>
                    <div className="flex gap-4">
                      {["True", "False"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            handleQuestionChange(qIndex, "correctAnswer", val)
                          }
                          className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            question.correctAnswer === val
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill in the Blank */}
                {question.type === "FILL_BLANK" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "correctAnswer",
                          e.target.value
                        )
                      }
                      placeholder="Enter correct answer..."
                      className="input"
                      required
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={question.explanation || ""}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    placeholder="Why is this the correct answer?"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update Quiz" : "Create Quiz"}
        </Button>
      </div>
    </form>
  );
}
