import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,

      login: (tokens, role, userData) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          user: userData,
          role: role,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        });
      },

      setTokens: ({ access, refresh }) => {
        set({
          accessToken: access,
          refreshToken: refresh,
        });
      },

      setUser: (userData) => {
        set({
          user: userData,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
      }),
    }
  )
);

export default useAuthStore;
