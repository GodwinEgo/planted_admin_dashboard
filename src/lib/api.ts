const API_URL = "http://192.168.133.128:6003/api/v1";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
  details?: unknown;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getToken();

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: User; tokens: { accessToken: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: { email, password },
      }
    );
  }

  // ============================================================================
  // Admin endpoints - Users
  // ============================================================================

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.userType) query.set("userType", params.userType);
    return this.request<{
      data: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/users?${query.toString()}`);
  }

  async getUser(userId: string) {
    return this.request<{ user: User }>(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User>) {
    return this.request<{ user: User }>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: data,
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: "DELETE" });
  }

  // ============================================================================
  // Admin endpoints - Children
  // ============================================================================

  async getChildren(params?: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string;
    ageGroup?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.parentId) query.set("parentId", params.parentId);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);

    return this.request<PaginatedResponse<Child>>(
      `/admin/children?${query.toString()}`
    );
  }

  async getChild(childId: string) {
    return this.request<{ child: Child }>(`/admin/children/${childId}`);
  }

  async deleteChild(childId: string) {
    return this.request(`/admin/children/${childId}`, { method: "DELETE" });
  }

  // ============================================================================
  // Admin endpoints - Dashboard Stats
  // ============================================================================

  async getDashboardStats() {
    return this.request<DashboardStats>("/admin/stats");
  }

  // ============================================================================
  // Admin endpoints - Devotionals
  // ============================================================================

  async getDevotionals(params?: {
    page?: number;
    limit?: number;
    search?: string;
    ageGroup?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return this.request<PaginatedResponse<Devotional>>(
      `/admin/devotionals?${query.toString()}`
    );
  }

  async getDevotional(devotionalId: string) {
    return this.request<{ devotional: Devotional }>(
      `/devotionals/${devotionalId}`
    );
  }

  async createDevotional(data: Partial<Devotional>) {
    return this.request<{ data: Devotional }>("/admin/devotionals", {
      method: "POST",
      body: data,
    });
  }

  async updateDevotional(devotionalId: string, data: Partial<Devotional>) {
    return this.request<{ data: Devotional }>(
      `/admin/devotionals/${devotionalId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
  }

  async deleteDevotional(devotionalId: string) {
    return this.request(`/admin/devotionals/${devotionalId}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // Admin endpoints - Memory Verses
  // ============================================================================

  async getMemoryVerses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    ageGroup?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return this.request<PaginatedResponse<MemoryVerse>>(
      `/admin/memory-verses?${query.toString()}`
    );
  }

  async createMemoryVerse(data: Partial<MemoryVerse>) {
    return this.request<{ memoryVerse: MemoryVerse }>("/admin/memory-verses", {
      method: "POST",
      body: data,
    });
  }

  async updateMemoryVerse(memoryVerseId: string, data: Partial<MemoryVerse>) {
    return this.request<{ memoryVerse: MemoryVerse }>(
      `/admin/memory-verses/${memoryVerseId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
  }

  async deleteMemoryVerse(memoryVerseId: string) {
    return this.request(`/admin/memory-verses/${memoryVerseId}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // Admin endpoints - Quizzes
  // ============================================================================

  async getQuizzes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    ageGroup?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return this.request<PaginatedResponse<Quiz>>(
      `/admin/quizzes?${query.toString()}`
    );
  }

  async createQuiz(data: Partial<Quiz>) {
    return this.request<{ quiz: Quiz }>("/admin/quizzes", {
      method: "POST",
      body: data,
    });
  }

  async updateQuiz(quizId: string, data: Partial<Quiz>) {
    return this.request<{ quiz: Quiz }>(`/admin/quizzes/${quizId}`, {
      method: "PATCH",
      body: data,
    });
  }

  async deleteQuiz(quizId: string) {
    return this.request(`/admin/quizzes/${quizId}`, { method: "DELETE" });
  }

  // ============================================================================
  // Admin endpoints - Stories
  // ============================================================================

  async getStories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    ageGroup?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return this.request<PaginatedResponse<Story>>(
      `/admin/stories?${query.toString()}`
    );
  }

  async createStory(data: Partial<Story>) {
    return this.request<{ story: Story }>("/admin/stories", {
      method: "POST",
      body: data,
    });
  }

  async updateStory(storyId: string, data: Partial<Story>) {
    return this.request<{ story: Story }>(`/admin/stories/${storyId}`, {
      method: "PATCH",
      body: data,
    });
  }

  async deleteStory(storyId: string) {
    return this.request(`/admin/stories/${storyId}`, { method: "DELETE" });
  }

  // ============================================================================
  // Admin endpoints - Challenges
  // ============================================================================

  async getChallenges(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    return this.request<PaginatedResponse<Challenge>>(
      `/admin/challenges?${query.toString()}`
    );
  }

  async createChallenge(data: Partial<Challenge>) {
    return this.request<{ challenge: Challenge }>("/admin/challenges", {
      method: "POST",
      body: data,
    });
  }

  async updateChallenge(challengeId: string, data: Partial<Challenge>) {
    return this.request<{ challenge: Challenge }>(
      `/admin/challenges/${challengeId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
  }

  async deleteChallenge(challengeId: string) {
    return this.request(`/admin/challenges/${challengeId}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // Progress endpoints
  // ============================================================================

  async getProgress(params?: { userId?: string; childId?: string }) {
    const query = new URLSearchParams();
    if (params?.userId) query.set("userId", params.userId);
    if (params?.childId) query.set("childId", params.childId);
    return this.request<{ progress: Progress[] }>(
      `/progress?${query.toString()}`
    );
  }
}

// ============================================================================
// Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  isVerified: boolean;
  isOnboarded: boolean;
  role: "USER" | "ADMIN";
  userType: "PARENT" | "TEEN" | "KID";
  avatarUrl: string | null;
  referralCode: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: "MALE" | "FEMALE";
  ageGroup: "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN";
  avatarId: string;
  parentId: string;
  streak: number;
  totalStars: number;
  devotionalsCompleted: number;
  versesMemorized: number;
  quizzesTaken: number;
  averageQuizScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Devotional {
  id: string;
  title: string;
  subtitle?: string | null;
  bibleReference: string;
  verseText: string;
  content: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  prayerPrompt?: string | null;
  reflectionQuestions: string[];
  audience: "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN" | "PARENT";
  publishDate: string;
  tags: string[];
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryVerse {
  id: string;
  verseText: string;
  text?: string; // Legacy support
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  audience: "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN" | "PARENT";
  publishDate: string;
  topic?: string | null;
  hints?: string[];
  isActive: boolean;
  weekNumber?: number; // Legacy support
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  devotionalId?: string | null;
  audience: "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN" | "PARENT";
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number | null;
  publishDate: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
  options?: string[];
  correctAnswer: string;
  imageUrl?: string | null;
  explanation?: string | null;
  points: number;
}

export interface Story {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  bibleReference: string;
  seriesId?: string | null;
  emoji?: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  readTimeMinutes?: number;
  audience: "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN" | "PARENT";
  tags?: string[];
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "DAILY" | "WEEKLY" | "FAITH";
  category:
    | "PRAYER"
    | "DEVOTIONAL"
    | "MEMORY_VERSE"
    | "QUIZ"
    | "KINDNESS"
    | "GRATITUDE"
    | "DISCIPLINE";
  audience: "PARENT" | "SPROUT_EXPLORER" | "TRAILBLAZER_TEEN" | "ALL";
  targetCount: number;
  rewardStars: number;
  icon: string;
  verse?: string | null;
  durationDays: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  childId: string;
  type: "DEVOTIONAL" | "MEMORY_VERSE" | "QUIZ" | "STORY" | "CHALLENGE";
  contentId: string;
  completed: boolean;
  score?: number;
  completedAt: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalDevotionals: number;
  totalQuizzes: number;
  totalStories: number;
  totalChallenges: number;
  totalMemoryVerses: number;
  usersByType: { type: string; count: number }[];
  recentSignups: User[];
}

export const api = new ApiClient(API_URL);
export default api;
