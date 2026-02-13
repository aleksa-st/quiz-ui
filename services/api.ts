import {
  User, Quiz, Team, DashboardStats, ApiResponse, AuthResponse,
  Question, QuizResult, ChatConversation, ChatMessage, Challenge,
  LeaderboardEntry, Achievement, AppSettings, LandingData
} from '../types';
import { ENV } from '../src/config/env';

const BASE_URL = ENV.API_URL;

// --- HTTP CLIENT HELPER ---

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Custom API Error class to carry validation errors
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login if needed, handled by App state usually
      if (!window.location.hash.includes('login') && !window.location.hash.includes('register')) {
        window.location.hash = '#login';
      }
    }
    // Throw ApiError with validation details
    throw new ApiError(data.message || 'Something went wrong', response.status, data.errors);
  }

  return data;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// --- API SERVICE ---

export const api = {
  // 1. Authentication
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (data: any) =>
      request<AuthResponse>('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword
        }),
      }),

    logout: () => request<void>('/logout', { method: 'POST' }),

    // We use getProfile to validate token on app load
    validateToken: () => request<User>('/profile'),

    forgotPassword: (email: string) =>
      request<{ otp: string }>('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    verifyOtp: (email: string, otp: string) =>
      request<void>('/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      }),

    resetPassword: (data: any) =>
      request<void>('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  },

  // 2. Profile
  profile: {
    get: () => request<User>('/profile'),

    updatePersonal: (data: any) =>
      request<User>('/profile/personal', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    updateCareer: (data: any) =>
      request<User>('/profile/career', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    updateEducation: (data: any) =>
      request<User>('/profile/educational', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    uploadAvatar: async (formData: FormData) => {
      // Special handling for multipart/form-data (no Content-Type header manually set)
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });
      return handleResponse<{ avatar_url: string }>(response);
    },
  },

  // 3. App Settings
  appSettings: {
    get: () => request<AppSettings>('/app-settings'),
  },

  // 4. Quizzes
  quizzes: {
    getLandingData: () => request<LandingData>('/landing-data'),

    create: (data: any) => request<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    getCategories: () => request<{ id: number; name: string }[]>('/quiz-categories'),

    getSubjects: (categoryId: number) => request<any[]>(`/categories/${categoryId}/subjects`),

    getTopics: (subjectId: number) => request<any[]>(`/subjects/${subjectId}/topics`),

    canCreate: () => request<{ can_create: boolean }>('/user/can-create-quiz'),

    getExplore: (params: Record<string, any> = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = params.created_by_me ? `/my-quizzes?${queryString}` : `/quizzes/explore?${queryString}`;
      return request<Quiz[]>(endpoint);
    },

    getDetail: (id: number) => request<Quiz>(`/quizzes/${id}/detail`),

    startQuiz: (id: number) => request<{ attempt_id: number; attempt_number: number }>(`/quizzes/${id}/start`, { method: 'POST' }),

    getQuestions: (attemptId: number) => request<Question[]>(`/attempts/${attemptId}/questions`),

    // Submit answer for a specific attempt
    submitAnswer: (attemptId: number, data: { question_id: number; selected_answer: string; time_spent: number }) =>
      request<void>(`/attempts/${attemptId}/submit-answer`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    finish: (attemptId: number) => request<{ result_id: number; is_best_score: boolean }>(`/attempts/${attemptId}/finish`, { method: 'POST' }),

    getResult: (id: number) => request<QuizResult>(`/quiz-results/${id}`),

    getLatestResult: (quizId: number) => request<QuizResult>(`/quizzes/${quizId}/my-result`),

    getHistory: () => request<import('../types').QuizHistoryEntry[]>('/my-quiz-history'),
  },

  // 5. Teams
  teams: {
    getMyTeams: () => request<Team[]>('/teams'),

    create: (data: Partial<Team>) =>
      request<Team>('/teams/create', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    join: (code: string) =>
      request<any>('/teams/join', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

    invite: (teamId: number, userIds: number[]) =>
      request<void>(`/teams/${teamId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ user_ids: userIds })
      }),

    getDetails: (id: number) => request<Team>(`/teams/${id}`),

    getMessages: (teamId: number) => request<import('../types').TeamMessage[]>(`/teams/${teamId}/messages`),

    sendMessage: (teamId: number, message: string) =>
      request<import('../types').TeamMessage>(`/teams/${teamId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      }),

    searchUsers: (query: string) => request<User[]>(`/users/search?q=${encodeURIComponent(query)}`),

    removeMember: (teamId: number, userId: number) =>
      request<void>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),

    promoteMember: (teamId: number, userId: number) =>
      request<void>(`/teams/${teamId}/members/${userId}/promote`, { method: 'POST' }),

    getInvitations: () => request<import('../types').TeamInvitation[]>('/team-invitations'),

    respondInvitation: (id: number, accept: boolean) =>
      request<void>(`/team-invitations/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action: accept ? 'accept' : 'decline' })
      }),
  },

  // 6. Chat
  chat: {
    getConversations: () => request<ChatConversation[]>('/chat/conversations'),

    getMessages: (userId: number) =>
      request<{ messages: ChatMessage[]; user: any }>(`/chat/${userId}/messages`),

    sendMessage: (userId: number, message: string) =>
      request<void>(`/chat/${userId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      }),

    getTeamMessages: (teamId: number) => request<any>(`/teams/${teamId}/messages`),

    sendTeamMessage: (teamId: number, message: string) =>
      request<void>(`/teams/${teamId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      }),
  },

  // 7. Challenges
  challenges: {
    send: (data: any) =>
      request<void>('/challenges/send', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    getReceived: () => request<Challenge[]>('/challenges/received'),

    respond: (id: number, action: 'accept' | 'decline') =>
      request<void>(`/challenges/${id}/${action}`, {
        method: 'POST'
      }),

    complete: (data: any) =>
      request<void>('/challenges/complete', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  },

  // 8. Analytics & Stats
  stats: {
    getDashboardStats: () => request<DashboardStats>('/dashboard-stats'),

    getPerformance: (period = 30, metric = 'accuracy') =>
      request<any>(`/analytics/performance?period=${period}&metric=${metric}`),

    getStreak: () => request<any>('/analytics/streak'),

    getCategories: () => request<any>('/analytics/categories'),
  },

  // 9. Achievements & Leaderboard
  achievements: {
    getAll: () => request<Achievement[]>('/achievements'),
    getUser: () => request<Achievement[]>('/achievements/user'),
  },

  leaderboard: {
    get: (params: Record<string, any> = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return request<LeaderboardEntry[]>(`/leaderboard?${queryString}`);
    },
  },

  // 10. General API helper
  get: (endpoint: string) => request<any>(endpoint),

  // 11. AI & Live Quiz
  ai: {
    checkLimit: () => request<{ remaining: number }>('/ai/check-limit'),
    generateQuiz: (data: { topic: string; difficulty: string; question_count: number }) =>
      request<{ quiz_id: number }>('/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  },

  liveQuiz: {
    // Create a new live quiz session
    create: (data: { quiz_id: number; time_per_question: number; max_participants?: number }) =>
      request<{ session_code: string; session: any }>('/live-quiz/create', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    // Join an existing session
    join: (code: string) =>
      request<{ session: any }>('/live-quiz/join', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

    // Get session details (for lobby and status)
    getSession: (code: string) =>
      request<any>(`/live-quiz/session/${code}`),

    // Start the quiz (host only)
    start: (code: string) =>
      request<{ started: boolean }>(`/live-quiz/start`, {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

    // Get current question
    getCurrentQuestion: (code: string) =>
      request<any>(`/live-quiz/question/${code}`),

    // Submit answer
    submitAnswer: (data: {
      session_code: string;
      question_id: number;
      answer: string;
      time_taken: number;
    }) =>
      request<{
        is_correct: boolean;
        correct_answer: string;
        points_earned: number;
        your_score: number;
        rank: number;
      }>('/live-quiz/answer', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    // Get leaderboard
    getLeaderboard: (code: string) =>
      request<any>(`/live-quiz/leaderboard/${code}`),

    // Leave session
    leave: (code: string) =>
      request<void>(`/live-quiz/leave`, {
        method: 'POST',
        body: JSON.stringify({ code })
      }),
  }
};