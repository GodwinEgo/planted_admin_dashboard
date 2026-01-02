"use client";

import { Button } from "@/components/ui";
import { MemoryVerse } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MemoryVerseFormProps {
  initialData?: Partial<MemoryVerse>;
  onSubmit: (data: Partial<MemoryVerse>) => Promise<void>;
  isLoading?: boolean;
}

export function MemoryVerseForm({
  initialData,
  onSubmit,
  isLoading,
}: MemoryVerseFormProps) {
  const [formData, setFormData] = useState<Partial<MemoryVerse>>({
    verseText: "",
    reference: "",
    book: "",
    chapter: 1,
    verseStart: 1,
    verseEnd: null,
    audience: "SPROUT_EXPLORER",
    publishDate: new Date().toISOString().split("T")[0],
    topic: "",
    hints: [""],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        publishDate: initialData.publishDate
          ? new Date(initialData.publishDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        hints:
          initialData.hints && initialData.hints.length > 0
            ? initialData.hints
            : [""],
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

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...(formData.hints || [])];
    newHints[index] = value;
    setFormData((prev) => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData((prev) => ({ ...prev, hints: [...(prev.hints || []), ""] }));
  };

  const removeHint = (index: number) => {
    const newHints = [...(formData.hints || [])];
    newHints.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      hints: newHints.length > 0 ? newHints : [""],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      hints: formData.hints?.filter((h) => h.trim() !== "") || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Verse Reference (e.g. John 3:16)
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            placeholder="John 3:16"
            className="input"
            required
          />
        </div>

        {/* Verse Text */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Verse Text
          </label>
          <textarea
            name="verseText"
            value={formData.verseText}
            onChange={handleChange}
            placeholder="For God so loved the world..."
            className="input min-h-[100px]"
            required
          />
        </div>

        {/* Details: Book, Chapter, Verse Start, Verse End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Book
          </label>
          <input
            type="text"
            name="book"
            value={formData.book}
            onChange={handleChange}
            placeholder="John"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chapter
          </label>
          <input
            type="number"
            name="chapter"
            value={formData.chapter}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Verse Start
          </label>
          <input
            type="number"
            name="verseStart"
            value={formData.verseStart}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Verse End (Optional)
          </label>
          <input
            type="number"
            name="verseEnd"
            value={formData.verseEnd || ""}
            onChange={handleChange}
            className="input"
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

        {/* Topic */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic (Optional)
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic || ""}
            onChange={handleChange}
            placeholder="Love, Faith, Kindness..."
            className="input"
          />
        </div>

        {/* Hints */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hints for Memorization
            </label>
            <button
              type="button"
              onClick={addHint}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Hint
            </button>
          </div>
          <div className="space-y-2">
            {formData.hints?.map((hint, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => handleHintChange(index, e.target.value)}
                  placeholder={`Hint ${index + 1}`}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
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

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
        <Button type="submit" isLoading={isLoading} className="px-8">
          {initialData?.id ? "Update Memory Verse" : "Create Memory Verse"}
        </Button>
      </div>
    </form>
  );
}
