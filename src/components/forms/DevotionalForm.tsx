"use client";

import { Button } from "@/components/ui";
import { Devotional } from "@/lib/api";
import {
  BookText,
  Hash,
  HelpCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DevotionalFormProps {
  initialData?: Partial<Devotional>;
  onSubmit: (data: Partial<Devotional>) => Promise<void>;
  isLoading?: boolean;
}

export function DevotionalForm({
  initialData,
  onSubmit,
  isLoading,
}: DevotionalFormProps) {
  const [formData, setFormData] = useState<Partial<Devotional>>({
    title: "",
    subtitle: "",
    bibleReference: "",
    verseText: "",
    content: "",
    prayerPrompt: "",
    reflectionQuestions: [],
    audience: "SPROUT_EXPLORER",
    publishDate: new Date().toISOString().split("T")[0],
    tags: [],
    isActive: true,
  });

  const [questionInput, setQuestionInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        publishDate: initialData.publishDate
          ? new Date(initialData.publishDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reflectionQuestions: initialData.reflectionQuestions || [],
        tags: initialData.tags || [],
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleAddQuestion = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && questionInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        reflectionQuestions: [
          ...(prev.reflectionQuestions || []),
          questionInput.trim(),
        ],
      }));
      setQuestionInput("");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reflectionQuestions: prev.reflectionQuestions?.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Devotional Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Walking on Water"
            className="input"
            required
          />
        </div>

        {/* Subtitle */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle || ""}
            onChange={handleChange}
            placeholder="e.g. Trusting Jesus in the storms of life"
            className="input"
          />
        </div>

        {/* Bible Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bible Reference
          </label>
          <div className="relative">
            <BookText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="bibleReference"
              value={formData.bibleReference}
              onChange={handleChange}
              placeholder="e.g. Matthew 14:22-33"
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Publish Date */}
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

        {/* Verse Text */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key Verse Text
          </label>
          <textarea
            name="verseText"
            value={formData.verseText}
            onChange={handleChange}
            placeholder="&ldquo;Take courage! It is I. Don't be afraid.&rdquo;"
            className="input min-h-[80px] italic"
            required
          />
        </div>

        {/* Audience */}
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
            <option value="PARENT">Parents</option>
          </select>
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Devotional Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write the devotional content here..."
            className="input min-h-[250px] leading-relaxed"
            required
          />
        </div>

        {/* Prayer Prompt */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prayer Prompt
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
            <textarea
              name="prayerPrompt"
              value={formData.prayerPrompt || ""}
              onChange={handleChange}
              placeholder="Dear Jesus, help me to keep my eyes on You..."
              className="input pl-10 min-h-[80px]"
            />
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reflection Questions (Press Enter to add)
          </label>
          <div className="relative">
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={handleAddQuestion}
              placeholder="Add a question for the child to think about..."
              className="input pl-10"
            />
          </div>
          {formData.reflectionQuestions &&
            formData.reflectionQuestions.length > 0 && (
              <ul className="mt-3 space-y-2">
                {formData.reflectionQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 items-start group">
                    <span className="flex-1 text-sm bg-gray-50 dark:bg-dark-hover/50 p-2 rounded-lg border border-gray-100 dark:border-dark-border">
                      {q}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (Press Enter to add)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. faith, trust, courage..."
              className="input pl-10"
            />
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-lg"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              formData.isActive
                ? "bg-primary-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active / Published
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
        <Button type="submit" isLoading={isLoading} className="px-8">
          {initialData?.id ? "Update Devotional" : "Create Devotional"}
        </Button>
      </div>
    </form>
  );
}
