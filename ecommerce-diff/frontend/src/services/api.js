import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, ENDPOINTS } from '@constants/url';
import { localStorageService } from './localStorage';

export const AUTH_STORAGE_KEYS = {
  ACCESS: 'aura.access',
  REFRESH: 'aura.refresh',
  USER: 'aura.user',
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorageService.get(AUTH_STORAGE_KEYS.ACCESS);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let waitQueue = [];

const flushQueue = (err, token = null) => {
  waitQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  waitQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message?.toString() || error.message || 'Network error';

    if (status === 401 && !original?._retry && !original?.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorageService.get(AUTH_STORAGE_KEYS.REFRESH);
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken,
        });
        const payload = data?.data || {};
        localStorageService.set(AUTH_STORAGE_KEYS.ACCESS, payload.accessToken);
        localStorageService.set(AUTH_STORAGE_KEYS.REFRESH, payload.refreshToken);
        flushQueue(null, payload.accessToken);
        original.headers.Authorization = `Bearer ${payload.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        localStorageService.remove(AUTH_STORAGE_KEYS.ACCESS);
        localStorageService.remove(AUTH_STORAGE_KEYS.REFRESH);
        localStorageService.remove(AUTH_STORAGE_KEYS.USER);
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else if (!['/login', '/register'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status && status !== 401) {
      toast.error(Array.isArray(message) ? message[0] : message, { className: 'aura-toast' });
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response?.data?.data ?? response?.data;
export const unwrapMeta = (response) => ({ data: response?.data?.data, meta: response?.data?.meta });

export default api;
