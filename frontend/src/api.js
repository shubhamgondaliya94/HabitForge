import axios from 'axios';

// Normalize `VITE_API_BASE` to ensure it always includes the `/api` route prefix
const getApiBase = () => {
  let envBase = import.meta.env.VITE_API_BASE;
  if (!envBase || envBase === '/' || envBase === '') {
    return '/api';
  }
  envBase = envBase.replace(/\/+$/, '');
  if (!envBase.endsWith('/api')) {
    envBase += '/api';
  }
  return envBase;
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Intercept requests to attach JWT auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('habitforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  togglePremium: () => api.post('/auth/toggle-premium'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addFriend: (friendUsername) => api.post('/auth/add-friend', { friendUsername }),
  deleteAccount: () => api.delete('/auth/account')
};

export const habitAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (habitData) => api.post('/habits', habitData),
  updateHabit: (id, habitData) => api.put(`/habits/${id}`, habitData),
  deleteHabit: (id) => api.delete(`/habits/${id}`)
};

export const completionAPI = {
  toggle: (habitId, dateStr) => api.post('/completions/toggle', { habitId, dateStr }),
  getHeatmap: () => api.get('/completions/heatmap'),
  getAnalytics: () => api.get('/completions/analytics'),
  exportCSV: () => api.get('/completions/export', { responseType: 'blob' })
};

export const leaderboardAPI = {
  getLeaderboard: (scope = 'global', page = 1) => api.get(`/leaderboard?scope=${scope}&page=${page}`)
};

export const aiAPI = {
  getCoach: () => api.get('/ai/coach')
};

export default api;
