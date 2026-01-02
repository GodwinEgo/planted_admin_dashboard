"use client";

import { Button } from "@/components/ui";
import { Challenge } from "@/lib/api";
import { Calendar, Star, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface ChallengeFormProps {
  initialData?: Partial<Challenge>;
  onSubmit: (data: Partial<Challenge>) => Promise<void>;
  isLoading?: boolean;
}

export function ChallengeForm({
  initialData,
  onSubmit,
  isLoading,
}: ChallengeFormProps) {
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: "",
    description: "",
    type: "DAILY",
    category: "PRAYER",
    audience: "ALL",
    targetCount: 1,
    rewardStars: 25,
    icon: "🎯",
    verse: "",
    durationDays: 1,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : undefined,
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : undefined,
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
            Challenge Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Daily Quiet Time"
            className="input"
            required
          />
        </div>

        {/* Icon & Type */}
        <div className="flex gap-4">
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="🎯"
              className="input text-center text-xl"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Challenge Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="DAILY">Daily Task</option>
              <option value="WEEKLY">Weekly Challenge</option>
              <option value="FAITH">Faith Milestone</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="PRAYER">Prayer</option>
            <option value="DEVOTIONAL">Devotional</option>
            <option value="MEMORY_VERSE">Memory Verse</option>
            <option value="QUIZ">Quiz</option>
            <option value="KINDNESS">Kindness</option>
            <option value="GRATITUDE">Gratitude</option>
            <option value="DISCIPLINE">Discipline</option>
          </select>
        </div>

        {/* Target Count & Reward */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Count
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="targetCount"
                value={formData.targetCount}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stars Reward
            </label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="rewardStars"
                value={formData.rewardStars}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Duration & Audience */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (Days)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>
          <div className="flex-1">
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
              <option value="ALL">All Users</option>
              <option value="SPROUT_EXPLORER">Sprout Explorers (3-9)</option>
              <option value="TRAILBLAZER_TEEN">Trailblazers (10-17)</option>
              <option value="PARENT">Parents Only</option>
            </select>
          </div>
        </div>

        {/* Bible Verse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Supporting Verse (Optional)
          </label>
          <input
            type="text"
            name="verse"
            value={formData.verse || ""}
            onChange={handleChange}
            placeholder="e.g. Philippians 4:13"
            className="input"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain the challenge..."
            className="input min-h-[100px]"
            required
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date (Scheduled)
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date (Scheduled)
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            className="input"
          />
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
            Active Challenge
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
        <Button type="submit" isLoading={isLoading} className="px-8">
          {initialData?.id ? "Update Challenge" : "Create Challenge"}
        </Button>
      </div>
    </form>
  );
}
