import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  telegram_id?: string;
  first_name: string;
  hearts: number;
  max_hearts: number;
  streak_days: number;
  xp_points: number;
  language: "english" | "pidgin" | "yoruba" | "hausa" | "igbo";
  subscription_type: "free" | "cram_pass" | "season_pass";
}

interface EduNaijaStore {
  user: User | null;
  currentSubject: string;
  currentExam: "JAMB" | "WAEC" | "NECO" | "POST_UTME";
  isDarkMode: boolean;
  isOffline: boolean;
  setUser: (user: User) => void;
  setHearts: (hearts: number) => void;
  setSubject: (subject: string) => void;
  setExam: (exam: "JAMB" | "WAEC" | "NECO" | "POST_UTME") => void;
  toggleDarkMode: () => void;
  setOffline: (offline: boolean) => void;
}

export const useEduNaijaStore = create<EduNaijaStore>()(
  persist(
    (set) => ({
      user: null,
      currentSubject: "PHYSICS",
      currentExam: "JAMB",
      isDarkMode: true, // Default dark for Nigerian night study sessions
      isOffline: false,
      setUser: (user) => set({ user }),
      setHearts: (hearts) =>
        set((state) => ({
          user: state.user ? { ...state.user, hearts } : null,
        })),
      setSubject: (currentSubject) => set({ currentSubject }),
      setExam: (currentExam) => set({ currentExam }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setOffline: (isOffline) => set({ isOffline }),
    }),
    {
      name: "edunaija-storage",
      partialize: (state) => ({
        user: state.user,
        currentSubject: state.currentSubject,
        currentExam: state.currentExam,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
