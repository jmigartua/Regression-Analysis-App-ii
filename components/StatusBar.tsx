
import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface StatusBarProps {
    rowCount: number;
    isLoading: boolean;
    status: 'Ready' | 'Error';
}

export const StatusBar: React.FC<StatusBarProps> = ({ rowCount, isLoading, status }) => {
    const { t } = useAppContext();
    
    const StatusIcon = () => {
        if (isLoading) return <Loader className="w-3.5 h-3.5 mr-2 animate-spin text-accent" />;
        if (status === 'Error') return <AlertCircle className="w-3.5 h-3.5 mr-2 text-red-500" />;
        return <CheckCircle className="w-3.5 h-3.5 mr-2 text-text-tertiary dark:text-gray-500" />;
    };

    const statusText = () => {
        if (isLoading) return t('header.analyzing');
        if (status === 'Error') return t('statusbar.error');
        return t('statusbar.ready');
    }

    return (
        <footer className="h-6 bg-header dark:bg-dark-header flex-shrink-0 border-t border-border dark:border-dark-border flex items-center justify-between px-4 text-xs text-text-secondary dark:text-gray-400">
            <div className="flex items-center">
                <StatusIcon />
                <span>{statusText()}</span>
            </div>
            <div className="flex items-center space-x-4">
                {rowCount > 0 && <span>{t('statusbar.rows')}: {rowCount}</span>}
                <span>UTF-8</span>
                <span>{`{ }`}</span>
                <span>{t('statusbar.type')}</span>
            </div>
        </footer>
    );
};
