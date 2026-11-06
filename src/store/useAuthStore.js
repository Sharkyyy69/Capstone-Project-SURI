import { create } from 'zustand';

const STORAGE_KEY = 'suri-auth';

function getStoredAuth() {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { user: null, token: null };

    const parsed = JSON.parse(stored);
    return {
      user: parsed?.user ?? null,
      token: parsed?.token ?? null,
    };
  } catch {
    return { user: null, token: null };
  }
}

const useAuthStore = create((set) => ({
  user: getStoredAuth().user,
  token: getStoredAuth().token,
  setAuth: (user, token, persist = true) => {
    if (typeof window !== 'undefined') {
      if (persist) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({ user, token });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ user: null, token: null });
  },
}));

export default useAuthStore;
