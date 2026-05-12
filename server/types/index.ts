// Common types for the backend

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IPollOption {
  _id: string;
  text: string;
  voteCount: number;
}

export interface IQuestion {
  _id: string;
  text: string;
  options: IPollOption[];
  isMandatory: boolean;
  type: "single";
  totalVotes: number;
}

export interface IPollSettings {
  anonymous: boolean;
  isPublished: boolean;
}

export interface IPoll {
  _id: string;
  pollCode: string;
  title: string;
  description?: string;
  questions: IQuestion[];
  createdBy: string;
  totalParticipants: number;
  visibility: "public" | "private" | "unlisted";
  settings: IPollSettings;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoteResponse {
  questionId: string;
  selectedOptionId: string;
}

export interface IVote {
  _id: string;
  pollId: string;
  voterId?: string;
  voterIp: string;
  responses: IVoteResponse[];
  createdAt: Date;
}

// Request/Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}
