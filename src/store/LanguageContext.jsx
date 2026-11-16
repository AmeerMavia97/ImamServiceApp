import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LANGUAGE, LANGUAGES_UI } from '@/constants/languages';
import { getSavedLanguage, saveLanguage } from '@/utils/storage';

const LanguageContext = createContext({ language: DEFAULT_LANGUAGE, setLanguage: () => {} });

// Holds the selected app language and remembers it between launches.
// NOTE: screens are not translated yet; read `language` here when they are.
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    getSavedLanguage().then((saved) => {
      if (saved && LANGUAGES_UI.some((l) => l.value === saved)) setLanguageState(saved);
    });
  }, []);

  const setLanguage = useCallback((next) => {
    setLanguageState(next);
    saveLanguage(next);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
