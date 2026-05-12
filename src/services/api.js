import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch custom event so AuthContext can clear user state
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Poll APIs
export const createPoll = (pollData) => API.post('/polls', pollData);
export const getMyPolls = () => API.get('/polls/my-polls');
export const getPollByCode = (code) => API.get(`/polls/${code}`);
export const publishPoll = (code) => API.patch(`/polls/${code}/publish`);
export const getPollAnalytics = (code) => API.get(`/polls/${code}/analytics`);

// Vote APIs
export const submitVote = (voteData) => API.post('/votes', voteData);

// Auth APIs
export const updateDisplayName = (displayName) => API.patch('/auth/update-display-name', { displayName });

// New Poll CRUD
export const deletePoll = (code) => API.delete(`/polls/${code}`);
export const updatePoll = (code, data) => API.put(`/polls/${code}`, data);
export const closePoll = (code) => API.patch(`/polls/${code}/close`);

export default API;
