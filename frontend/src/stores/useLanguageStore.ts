import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLanguage = 'en' | 'ta';

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'en' ? 'ta' : 'en' })),
    }),
    {
      name: 'ssk_language_preference',
    }
  )
);
