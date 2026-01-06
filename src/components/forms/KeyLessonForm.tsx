"use client";

import { Button } from "@/components/ui";
import { KeyLesson } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface KeyLessonFormProps {
  initialData?: Partial<KeyLesson>;
  onSubmit: (data: Partial<KeyLesson>) => Promise<void>;
  isLoading?: boolean;
}

export function KeyLessonForm({
  initialData,
  onSubmit,
  isLoading,
}: KeyLessonFormProps) {
  const [formData, setFormData] = useState<Partial<KeyLesson>>({
    dayId: "",
    publishDate: new Date().toISOString().split("T")[0],
    audience: "SPROUT_EXPLORER",
    bibleReading: "",
    lessons: [{ order: 1, text: "" }],
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
        lessons:
          initialData.lessons && initialData.lessons.length > 0
            ? initialData.lessons
            : [{ order: 1, text: "" }],
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleLessonChange = (index: number, value: string) => {
    const newLessons = [...(formData.lessons || [])];
    newLessons[index] = { order: index + 1, text: value };
    setFormData((prev) => ({ ...prev, lessons: newLessons }));
  };

  const addLesson = () => {
    const newOrder = (formData.lessons?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      lessons: [...(prev.lessons || []), { order: newOrder, text: "" }],
    }));
  };

  const removeLesson = (index: number) => {
    const newLessons = [...(formData.lessons || [])];
    newLessons.splice(index, 1);
    // Re-order remaining lessons
    const reorderedLessons = newLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1,
    }));
    setFormData((prev) => ({
      ...prev,
      lessons: reorderedLessons.length > 0 ? reorderedLessons : [{ order: 1, text: "" }],
    }));
  };

  // Auto-generate dayId from publishDate
  const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      publishDate: dateValue,
      dayId: dateValue.replace(/-/g, ""), // Convert 2026-01-18 to 20260118
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      lessons: formData.lessons?.filter((l) => l.text.trim() !== "") || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publish Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Publish Date
          </label>
          <input
            type="date"
            name="publishDate"
            value={formData.publishDate}
            onChange={handlePublishDateChange}
            className="input"
            required
          />
        </div>

        {/* Day ID (auto-generated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Day ID
          </label>
          <input
            type="text"
            name="dayId"
            value={formData.dayId}
            onChange={handleChange}
            placeholder="e.g., 20260118"
            className="input bg-gray-50 dark:bg-dark-hover"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated from publish date (format: YYYYMMDD)
          </p>
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
            <option value="SPROUT_EXPLORER">Sprout Explorers (Ages 5-8)</option>
            <option value="TRAILBLAZER_TEEN">Trailblazer Teens (Ages 9-12)</option>
          </select>
        </div>

        {/* Bible Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bible Reading
          </label>
          <input
            type="text"
            name="bibleReading"
            value={formData.bibleReading}
            onChange={handleChange}
            placeholder="e.g., Genesis 1:1-10"
            className="input"
            required
          />
        </div>

        {/* Key Lessons */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Key Lessons
            </label>
            <button
              type="button"
              onClick={addLesson}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Lesson
            </button>
          </div>
          <div className="space-y-3">
            {formData.lessons?.map((lesson, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-semibold">
                  {index + 1}
                </span>
                <textarea
                  value={lesson.text}
                  onChange={(e) => handleLessonChange(index, e.target.value)}
                  placeholder={`Key lesson ${index + 1}...`}
                  className="input flex-1 min-h-[80px]"
                  required
                />
                {(formData.lessons?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Add the key lessons children should learn from today&apos;s Bible reading.
          </p>
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
          {initialData?._id ? "Update Key Lesson" : "Create Key Lesson"}
        </Button>
      </div>
    </form>
  );
}
