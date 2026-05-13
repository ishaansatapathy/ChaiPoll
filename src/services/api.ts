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
const API_BASE_URL: string = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api/v1";

const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying and not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await API.post("/auth/refresh");
          isRefreshing = false;
          onRefreshed();
          return API(originalRequest);
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          return Promise.reject(error);
        }
      } else {
        // Another request is already refreshing — queue this one
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(API(originalRequest));
          });
        });
      }
    }

    if (error.response?.status === 401) {
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
export const getPollAnalytics = (code: string, page = 1) => 
  API.get<any>(`/polls/${code}/analytics`, { params: { page } });
export const exportPollData = (code: string) => 
  API.get(`/polls/${code}/export`, { responseType: 'blob' });
export const getPollTimeSeries = (code: string) =>
  API.get<any>(`/polls/${code}/analytics/timeseries`);
export const deletePoll = (code: string) => API.delete(`/polls/${code}`);
export const updatePoll = (code: string, data: Partial<Poll>) => API.put<Poll>(`/polls/${code}`, data);
export const closePoll = (code: string) => API.patch<Poll>(`/polls/${code}/close`);

// --- Vote APIs ---
export const submitVote = (voteData: VoteData) => API.post("/votes", voteData);

export default API;
