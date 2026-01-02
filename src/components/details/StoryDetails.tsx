"use client";

import { Story } from "@/lib/api";
import { getAgeGroupColor, getAgeGroupLabel } from "@/lib/utils";
import { Bookmark, BookOpen, Clock, Tag } from "lucide-react";

interface StoryDetailsProps {
  story: Story;
}

export function StoryDetails({ story }: StoryDetailsProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Header Image/Emoji */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 flex items-center justify-center">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{story.emoji || "📖"}</span>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`badge ${getAgeGroupColor(story.audience || "")}`}>
            {getAgeGroupLabel(story.audience || "")}
          </span>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              story.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {story.isActive ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {story.title}
          </h2>
          {story.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 italic">
              {story.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary-500" />
            <span className="font-medium">{story.bibleReference}</span>
          </div>
          {story.readTimeMinutes && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{story.readTimeMinutes} min read</span>
            </div>
          )}
          {story.seriesId && (
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-primary-500" />
              <span>Series ID: {story.seriesId}</span>
            </div>
          )}
        </div>

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-hover text-xs text-gray-600 dark:text-gray-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
            {story.content}
          </p>
        </div>
      </div>

      {/* Audio Placeholder */}
      {story.audioUrl && (
        <div className="p-4 bg-gray-50 dark:bg-dark-card rounded-xl border border-dashed border-gray-200 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Audio Story Available</p>
              <p className="text-xs text-gray-500">URL: {story.audioUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
