
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'es' | 'eu';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadTranslations = async () => {
        try {
            const [enRes, esRes, euRes] = await Promise.all([
                fetch('/locales/en.json'),
                fetch('/locales/es.json'),
                fetch('/locales/eu.json')
            ]);
            if (!enRes.ok || !esRes.ok || !euRes.ok) {
                throw new Error('Failed to fetch one or more translation files.');
            }
            const [en, es, eu] = await Promise.all([
                enRes.json(),
                esRes.json(),
                euRes.json()
            ]);
            setTranslations({ en, es, eu });
        } catch (error) {
            console.error("Could not load translation files, using keys as fallback.", error);
            // On failure, the app will use translation keys as text
            setTranslations({ en: {}, es: {}, eu: {} });
        }
    };
    loadTranslations();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;

    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    
    const initialLang = savedLang || 'en';
    setLanguage(initialLang);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const t = useCallback((key: string, replacements: { [key: string]: string } = {}) => {
    const translationSet = translations[language];
    let translatedString = (translationSet && translationSet[key]) ? translationSet[key] : key;
    
    Object.keys(replacements).forEach(placeholder => {
        translatedString = translatedString.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return translatedString;
  }, [language, translations]);

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};