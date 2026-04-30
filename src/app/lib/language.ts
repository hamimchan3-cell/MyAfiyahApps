import { useEffect, useState } from "react";

export type AppLanguage = "en" | "ms";

export const LANGUAGE_KEY = "myafiyah:login-language";
const LANGUAGE_EVENT = "myafiyah-language-change";
const DEFAULT_LANGUAGE: AppLanguage = "ms";

export const getStoredLanguage = (): AppLanguage => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);

  if (storedLanguage === "en" || storedLanguage === "ms") {
    return storedLanguage;
  }

  window.localStorage.setItem(LANGUAGE_KEY, DEFAULT_LANGUAGE);
  return DEFAULT_LANGUAGE;
};

export const setStoredLanguage = (language: AppLanguage) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: language }));
};

export function useAppLanguage(): [AppLanguage, (language: AppLanguage) => void] {
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);

  useEffect(() => {
    const syncLanguage = () => setLanguageState(getStoredLanguage());
    const handleLanguageEvent = () => syncLanguage();

    window.addEventListener("storage", syncLanguage);
    window.addEventListener(LANGUAGE_EVENT, handleLanguageEvent);

    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageEvent);
    };
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setStoredLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  return [language, setLanguage];
}
