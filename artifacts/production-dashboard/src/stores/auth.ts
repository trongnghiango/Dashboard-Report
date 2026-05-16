import { create } from "zustand";
import { UserResponse, Abilities } from "@workspace/api-zod";

interface AuthState {
  user: UserResponse | null;
  abilities: Abilities;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserResponse, abilities: Abilities, accessToken: string) => void;
  clearAuth: () => void;
  can: (resource: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  abilities: {},
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, abilities, accessToken) => 
    set({ user, abilities, accessToken, isAuthenticated: true }),
  clearAuth: () => set({ user: null, abilities: {}, accessToken: null, isAuthenticated: false }),
  can: (resource, action) => {
    const abilities = get().abilities as Record<string, string[]>;
    return !!(abilities[resource]?.includes(action));
  },
}));
