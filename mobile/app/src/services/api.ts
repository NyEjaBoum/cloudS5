import axios from 'axios';
import router from '@/router';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.0.2.2:8080/api';

// ===== INSTANCE AXIOS =====
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteurs (du api.js)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

// ===== INTERFACES =====
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  error: string | null;
}

export interface UserStatus {
  exists: boolean;
  blocked: boolean;
  tentativesRestantes: number;
  message?: string;
  dateBlocage?: string;
}

export interface LoginResult {
  token: string;
  user: any;
}

// ===== FONCTIONS BLOCAGE =====
export async function checkUserStatus(firebaseToken: string): Promise<ApiResponse<UserStatus>> {
  const res = await api.post('/auth/firebase/check-status', null, {
    headers: { 'Authorization': `Bearer ${firebaseToken}` }
  });
  return res.data;
}

export async function loginWithFirebaseToken(firebaseToken: string): Promise<ApiResponse<LoginResult>> {
  const res = await api.post('/auth/firebase/login', null, {
    headers: { 'Authorization': `Bearer ${firebaseToken}` }
  });
  return res.data;
}

export async function registerFailedAttempt(email: string): Promise<ApiResponse<{ blocked: boolean; tentativesRestantes: number }>> {
  const res = await api.post('/auth/firebase/failed-attempt', { email });
  return res.data;
}

// ===== EXPORT =====
export default api;