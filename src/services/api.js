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
      // Ideally handle unauthorized errors
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

export default API;
