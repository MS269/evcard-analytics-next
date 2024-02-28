import { create } from 'zustand';

type State = {
  isSignedIn: boolean;
};

type Action = {
  signIn: () => void;
  signOut: () => void;
};

export const useAdminStore = create<State & Action>((set) => ({
  isSignedIn: false,
  signIn: () => set(() => ({ isSignedIn: true })),
  signOut: () => set(() => ({ isSignedIn: false })),
}));
