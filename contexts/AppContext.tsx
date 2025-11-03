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
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;

    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    
    const initialLang = savedLang || 'en';
    setLanguage(initialLang);
  }, []);
  
  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
      try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch translation file for ${lang}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        if (lang !== 'en') {
          // Fallback to English if the selected language fails
          await fetchTranslations('en');
        } else {
          // If English fails, there's a bigger issue.
          setTranslations({});
        }
      }
    };
    fetchTranslations(language);
  }, [language]);


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
    if (!translations) {
        return key; // Return key if translations are not loaded
    }
    let translatedString = translations[key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
        translatedString = translatedString.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return translatedString;
  }, [translations]);
  
  if (translations === null) {
      return null; // Render nothing until translations are loaded to prevent FOUC
  }

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