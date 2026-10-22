/**
 * Type definitions for the 10-Day SOP & General Knowledge Quiz Challenge
 */

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface UserProfile {
  staffId: string;
  staffName: string;
  avatarId: string;
  groupName: string;
  scores: Record<string, number>; // Day1: 600, Day2: 1200, etc.
  dayTimes?: Record<string, number>; // Day1: 42s, Day2: 55s
  totalPoints: number;
  totalTimeSeconds: number; // Cumulative quiz completion time (tie-breaker)
  lastCompletedDay: number;
  lastCompletedDate?: string; // YYYY-MM-DD date string of last completed quiz
}

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: string;
}

export interface IndividualLeaderboardEntry {
  rank: number;
  staffId: string;
  staffName: string;
  avatarId: string;
  groupName: string;
  totalPoints: number;
  totalTimeSeconds: number; // tie breaker
  lastCompletedDay: number;
  lastCompletedDate?: string;
}

export interface GroupMemberBrief {
  name: string;
  points: number;
  timeSeconds?: number;
}

export interface GroupLeaderboardEntry {
  rank: number;
  teamName: string;
  aggregatePoints: number;
  aggregateTimeSeconds: number;
  memberCount: number;
  members: GroupMemberBrief[];
}

export interface LeaderboardData {
  individuals: IndividualLeaderboardEntry[]; // Top 10 or all
  groups: GroupLeaderboardEntry[];
  allIndividuals: IndividualLeaderboardEntry[]; // All 50 staff members
}

export interface QuizSessionResult {
  day: number;
  correctCount: number;
  totalQuestions: number;
  participationBonus: number;
  accuracyBonus: number;
  multiplier: number;
  totalScore: number;
  timeTakenSeconds: number; // Time elapsed from start to completion
  answers: {
    questionId: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface MultiplierPhaseInfo {
  phase: number;
  name: string;
  multiplier: number;
  maxDaily: number;
  description: string;
  tagColor: string;
}
