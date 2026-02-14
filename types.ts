export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  avatar_initials?: string;
  role?: 'user' | 'admin';
  phone?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  job_title?: string;
  company?: string;
  industry?: string;
  experience_years?: number;
  career_level?: string;
  skills?: string[];
  highest_qualification?: string;
  institution?: string;
  field_of_study?: string;
  graduation_year?: number;
  certifications?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface DashboardStats {
  user_name: string;
  total_quizzes: number;
  avg_score: number;
  active_quizzes: Quiz[];
  stats: {
    quizzes_taken: number;
    average_score: number;
    teams_joined: number;
    achievements: number;
  }
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  total_questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time_limit?: number;
  thumbnail?: string;
  question_mode?: 'manual' | 'auto' | 'super' | 'ai';
  topic_id?: number;
}

export interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: { text: string; is_correct?: boolean }[];
  points?: number;
}

export interface QuestionBreakdown {
  question: string;
  user_answer: string;
  correct_answer: string;
  correct: boolean;
  time_spent: number;
  points_earned: number;
}

export interface QuizResult {
  quiz_title: string;
  total_score: number;
  correct_answers: number;
  incorrect_answers: number;
  total_questions: number;
  accuracy: number;
  time_taken: number;
  rank: number;
  total_participants: number;
  leaderboard: LeaderboardEntry[];
  question_breakdown?: QuestionBreakdown[];
}

export interface PointTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'points' | 'xp';
  event: string;
  description: string;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_initials: string;
  role: 'owner' | 'admin' | 'member';
  joined_date: string;
  total_score: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members_count?: number;
  role?: 'member' | 'admin' | 'owner';
  avatar_url?: string;
  avatar?: string; // Some APIs use avatar
  created_date?: string;
  members?: TeamMember[];
  total_score?: number;
}

export interface TeamInvitation {
  id: number;
  team_name: string;
  team_description?: string;
  invited_at: string;
  expires_at: string;
}

export interface TeamMessage {
  id: number;
  message: string;
  user_id: number;
  user_name: string;
  avatar?: string;
  avatar_initials: string;
  is_own: boolean;
  created_at: string;
}

export interface ChatConversation {
  user_id: number;
  user_name: string;
  avatar: string;
  avatar_initials: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
  last_seen: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  avatar: string;
  avatar_initials: string;
  is_own: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Challenge {
  id: number;
  challenger_name: string;
  challenger_avatar: string;
  challenger_initials: string;
  quiz_title: string;
  challenger_score: number;
  message: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  avatar_url: string;
  total_points: number;
  total_quizzes: number;
  average_accuracy: number;
  best_streak: number;
  last_activity: string;
  is_current_user: boolean;
}

export interface AppSettings {
  app_name: string;
  title: string;
  logo: string;
  favicon: string;
  welcome_message: string;
  quiz_instructions: string;
  contact_email: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  terms_url: string;
  privacy_url: string;
  max_quiz_time: number;
  questions_per_quiz: number;
  allow_registration: boolean;
  show_leaderboard: boolean;
  pusher_key?: string;
  pusher_cluster?: string;
}

export interface LandingStats {
  total_users: string;
  total_quizzes: string;
  total_questions: string;
  average_rating: string;
}

export interface LandingData {
  categories: any[]; // We can refine this later if needed
  stats?: LandingStats;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  currentPage: string;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

export interface QuizHistoryEntry {
  id: number;
  quiz_title: string;
  score: number;
  accuracy: number;
  completed_at: string;
  correct_answers: number;
  total_questions: number;
}

export type PageRoute =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'dashboard'
  | 'profile'
  | 'discovery'
  | 'create-quiz'
  | 'teams'
  | 'teams-discovery'
  | 'team-chat' // Dynamic: team-chat-{id}
  | 'direct-chat' // Dynamic: direct-chat-{id}
  | 'leaderboard'
  | 'quiz-details' // Dynamic: quiz-details-{id}
  | 'quiz-play'
  | 'quiz-results'
  | 'history'
  | 'analytics'
  | 'achievements'
  | 'challenges'
  | 'live-quiz'
  | 'live-quiz-lobby'
  | 'live-quiz-game'
  | 'google-callback';

// Live Quiz / Kahoot-style Types
export interface LiveQuizSession {
  code: string;
  quiz_id: number;
  quiz_title: string;
  host_id: number;
  host_name: string;
  status: 'waiting' | 'active' | 'completed';
  participants: LiveParticipant[];
  current_question_index: number;
  total_questions: number;
  time_per_question: number;
  max_participants?: number;
  created_at: string;
}

export interface LiveParticipant {
  id: number;
  name: string;
  avatar_url?: string;
  avatar_initials?: string;
  score: number;
  correct_answers: number;
  joined_at: string;
  is_host: boolean;
}

export interface LiveQuestion {
  id: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  question_number: number;
  total_questions: number;
  points: number;
}

export interface LiveAnswerResult {
  is_correct: boolean;
  correct_answer: string;
  points_earned: number;
  time_taken: number;
  your_score: number;
  rank: number;
}

export interface LiveLeaderboard {
  session_code: string;
  participants: LiveLeaderboardEntry[];
  current_question: number;
  total_questions: number;
}

export interface LiveLeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar_url?: string;
  avatar_initials?: string;
  score: number;
  correct_answers: number;
  average_time: number;
  is_current_user: boolean;
}

