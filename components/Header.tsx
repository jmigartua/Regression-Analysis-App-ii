
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
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
            </div>
        </header>
    );
};
