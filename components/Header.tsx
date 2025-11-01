
import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
    onRunAnalysis: () => void;
    isLoading: boolean;
    canRun: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRunAnalysis, isLoading, canRun }) => {
    const { t } = useAppContext();
    return (
        <header className="bg-header dark:bg-dark-header h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-border dark:border-dark-border z-20">
            <div className="flex items-center space-x-6">
                <h1 className="font-bold text-lg text-text-primary dark:text-white">{t('header.title')}</h1>
                <nav className="hidden md:flex items-center space-x-4 text-text-secondary dark:text-gray-400 text-sm">
                    <span className="cursor-default">{t('header.file')}</span>
                    <span className="cursor-default">{t('header.edit')}</span>
                    <span className="cursor-default">{t('header.view')}</span>
                    <span className="cursor-default">{t('header.run')}</span>
                    <span className="cursor-default">{t('header.help')}</span>
                </nav>
            </div>
            <div className="flex items-center space-x-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
                <button
                    onClick={onRunAnalysis}
                    disabled={isLoading || !canRun}
                    className="flex items-center justify-center bg-accent hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-1.5 px-4 rounded-md text-sm transition-colors duration-200"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('header.analyzing')}
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            {t('header.run')}
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};
