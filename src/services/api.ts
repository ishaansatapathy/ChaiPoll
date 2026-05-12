import axios, { AxiosInstance, AxiosResponse } from "axios";

// --- Types ---
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollQuestion {
  id: string;
  text: string;
  type: "single" | "multiple";
  options: PollOption[];
}

export interface Poll {
  _id?: string;
  code: string;
  question: string; // Legacy field
  title?: string;
  description?: string;
  questions: PollQuestion[];
  isPublished: boolean;
  isClosed: boolean;
  creator: string;
  createdAt: string;
}

export interface VoteData {
  pollCode: string;
  responses: {
    questionId: string;
    optionIds: string[];
  }[];
}

// --- Axios Config ---
const API_BASE_URL: string = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const updateDisplayName = (displayName: string) =>
  API.patch("/auth/update-display-name", { displayName });

// --- Poll APIs ---
export const createPoll = (pollData: Partial<Poll>) => API.post<Poll>("/polls", pollData);
export const getMyPolls = () => API.get<Poll[]>("/polls/my-polls");
export const getPollByCode = (code: string) => API.get<Poll>(`/polls/${code}`);
export const publishPoll = (code: string) => API.patch<Poll>(`/polls/${code}/publish`);
export const getPollAnalytics = (code: string) => API.get<any>(`/polls/${code}/analytics`);
export const deletePoll = (code: string) => API.delete(`/polls/${code}`);
export const updatePoll = (code: string, data: Partial<Poll>) => API.put<Poll>(`/polls/${code}`, data);
export const closePoll = (code: string) => API.patch<Poll>(`/polls/${code}/close`);

// --- Vote APIs ---
export const submitVote = (voteData: VoteData) => API.post("/votes", voteData);

export default API;
