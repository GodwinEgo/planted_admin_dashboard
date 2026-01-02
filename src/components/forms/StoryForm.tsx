"use client";

import { Button } from "@/components/ui";
import { Story } from "@/lib/api";
import { Clock, Hash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StoryFormProps {
  initialData?: Partial<Story>;
  onSubmit: (data: Partial<Story>) => Promise<void>;
  isLoading?: boolean;
}

export function StoryForm({
  initialData,
  onSubmit,
  isLoading,
}: StoryFormProps) {
  const [formData, setFormData] = useState<Partial<Story>>({
    title: "",
    description: "",
    content: "",
    bibleReference: "",
    audience: "SPROUT_EXPLORER",
    emoji: "📖",
    readTimeMinutes: 5,
    tags: [],
    isActive: true,
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        tags: initialData.tags || [],
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
            Story Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Noah's Ark"
            className="input"
            required
          />
        </div>

        {/* Emoji & Read Time */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Emoji
            </label>
            <input
              type="text"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              placeholder="📖"
              className="input text-center"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Read Time (Min)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="readTimeMinutes"
                value={formData.readTimeMinutes}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Bible Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bible Reference
          </label>
          <input
            type="text"
            name="bibleReference"
            value={formData.bibleReference}
            onChange={handleChange}
            placeholder="Genesis 6:9-9:17"
            className="input"
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

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description / Summary
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Brief summary for the story card..."
            className="input min-h-[80px]"
          />
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Story Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write the full bible story here..."
            className="input min-h-[300px] font-serif leading-relaxed"
            required
          />
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
              placeholder="e.g. faith, obedience, animals..."
              className="input pl-10"
            />
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-lg group"
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
          {initialData?.id ? "Update Story" : "Create Story"}
        </Button>
      </div>
    </form>
  );
}
