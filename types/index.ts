// Core data types for the Sync app

export type OptionId = 'A' | 'B' | 'C';

export interface Option {
  id: OptionId;
  text: string;
}

export interface Question {
  id: number;
  question_text: string;
  category: 'Travel' | 'Lifestyle' | 'Hypothetical' | 'Values' | 'Relationship' | 'Trivia';
  options: Option[];
}

export interface User {
  uid: string;
  name: string;
  email: string;
  partner_uid: string | null;
  total_score: number;
  streak: number;
  notification_preferences: {
    webPush: boolean;
    pushSubscription?: PushSubscription | null;
  };
  created_at: Date;
}

export type RoundStatus = 'pending' | 'completed';

export interface DailyRound {
  date_id: string; // "YYYY-MM-DD"
  day_number: number; // 1-365
  question_id: number;
  question_text: string;
  options: Option[];
  p1_answer: OptionId | null;
  p1_guess: OptionId | null;
  p1_status: boolean;
  p2_answer: OptionId | null;
  p2_guess: OptionId | null;
  p2_status: boolean;
  points_earned: number; // 0, 1, or 2
  status: RoundStatus;
  created_at: Date;
  completed_at?: Date;
}

export type UserId = 'p1' | 'p2';

export interface SubmitAnswerRequest {
  date: string;
  userId: UserId;
  answer: OptionId;
  guess: OptionId;
}

export interface SubmitAnswerResponse {
  success: boolean;
  points_earned?: number;
  both_completed?: boolean;
}
