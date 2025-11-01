
import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const languages = {
    en: 'English',
    es: 'Español',
    eu: 'Euskara'
};

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (lang: 'en' | 'es' | 'eu') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 flex items-center"
                aria-label="Change language"
            >
                <Languages className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-sidebar dark:bg-dark-sidebar border border-border dark:border-dark-border rounded-md shadow-lg z-50">
                    <ul className="py-1">
                        {Object.entries(languages).map(([code, name]) => (
                            <li key={code}>
                                <button
                                    onClick={() => handleLanguageChange(code as 'en' | 'es' | 'eu')}
                                    className={`w-full text-left px-4 py-2 text-sm ${language === code ? 'font-bold text-accent dark:text-accent' : 'text-text-primary dark:text-gray-300'} hover:bg-black/5 dark:hover:bg-white/10`}
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
