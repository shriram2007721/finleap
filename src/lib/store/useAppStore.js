
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  role: 'student', // student | teacher | school_coordinator | ngo_admin
  learnerId: null,
  setRole: (role) => set({ role }),
  setLearner: (id) => set({ learnerId: id }),
}));
