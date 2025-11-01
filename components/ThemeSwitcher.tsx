
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useAppContext();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
};
