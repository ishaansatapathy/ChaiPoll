// Common types for the application

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Poll Types
export interface PollOption {
  _id: string;
  text: string;
  voteCount: number;
}

export interface Question {
  _id: string;
  text: string;
  options: PollOption[];
  isMandatory: boolean;
  type: "single";
  totalVotes: number;
}

export interface PollSettings {
  anonymous: boolean;
  isPublished: boolean;
}

export interface Poll {
  _id: string;
  pollCode: string;
  title: string;
  description?: string;
  questions: Question[];
  createdBy: string;
  totalParticipants: number;
  visibility: "public" | "private" | "unlisted";
  settings: PollSettings;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Vote Types
export interface ResponseOption {
  questionId: string;
  selectedOptionId: string;
}

export interface VotePayload {
  pollCode: string;
  responses: ResponseOption[];
}

export interface Vote {
  _id: string;
  pollId: string;
  voterId?: string;
  voterIp: string;
  responses: ResponseOption[];
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Analytics Types
export interface OptionAnalytics {
  text: string;
  voteCount: number;
  percentage: number;
}

export interface QuestionAnalytics {
  id: string;
  text: string;
  isMandatory: boolean;
  totalResponses: number;
  options: OptionAnalytics[];
}

export interface PollAnalytics {
  pollCode: string;
  title: string;
  totalParticipants: number;
  isPublished: boolean;
  questions: QuestionAnalytics[];
  createdAt: Date;
}
