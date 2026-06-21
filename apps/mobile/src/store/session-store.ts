import { create } from 'zustand';
import type { StoredSession } from '../lib/auth-store';

interface SessionState {
  session: StoredSession | null;
  mpinVerified: boolean;
  setSession: (session: StoredSession | null) => void;
  setMpinVerified: (value: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  mpinVerified: false,
  setSession: (session) => set({ session }),
  setMpinVerified: (mpinVerified) => set({ mpinVerified }),
}));
