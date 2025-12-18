import { create } from 'zustand';
import api from '../api/client';

const ENDPOINTS = {
  users: '/admin/users',
  profiles: '/admin/profiles',
  plans: '/admin/plans',
  subscriptions: '/admin/subscriptions',
  liveClasses: '/admin/live-classes',
  trainers: '/admin/trainers',
  tasks: '/admin/daily-tasks',
  integrations: '/admin/integrations',
  communityPosts: '/admin/community/posts',
  communityComments: '/admin/community/comments',
  videos: '/admin/videos'
};

const useStore = create((set, get) => ({
  user: null,
  loginError: null,
  loading: {},
  dataCache: {},
  metrics: null,
  bootstrapped: false,

  bootstrap: async () => {
    try {
      const res = await api.get('/admin/me');
      if (res.data?.success && res.data?.user) {
        set({ user: res.data.user });
      }
    } catch {
      // ignore boot errors
    } finally {
      set({ bootstrapped: true });
    }
  },

  login: async ({ email, otp }) => {
    if (!email || !otp) {
      set({ loginError: 'Email and OTP are required' });
      return;
    }
    try {
      const res = await api.post('/admin/login', { email, otp });
      if (res.data?.success) {
        set({ user: res.data.user, loginError: null });
      } else {
        set({ loginError: res.data?.message || 'Login failed' });
      }
    } catch (err) {
      set({ loginError: err?.response?.data?.message || 'Login failed' });
    }
  },

  logout: async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      // ignore logout errors
    }
    set({ user: null });
  },

  fetchTable: async (key) => {
    const endpoint = ENDPOINTS[key];
    if (!endpoint) return;
    const { dataCache, loading } = get();
    if (dataCache[key] && !loading[key]) return; // already have data

    set({ loading: { ...loading, [key]: true } });
    try {
      const res = await api.get(endpoint);
      const rows = res.data?.rows || [];
      set((state) => ({
        dataCache: { ...state.dataCache, [key]: rows },
        loading: { ...state.loading, [key]: false }
      }));
    } catch (err) {
      set((state) => ({
        loading: { ...state.loading, [key]: false }
      }));
      throw err;
    }
  },

  fetchMetrics: async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data?.success) {
        set({ metrics: res.data.metrics });
      }
    } catch {
      // ignore
    }
  }
}));

export default useStore;
