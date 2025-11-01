
import React from 'react';
import { Files, Search, GitBranch, BugPlay, Package } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const IconWrapper: React.FC<{ children: React.ReactNode; active?: boolean; tooltip: string }> = ({ children, active, tooltip }) => (
    <div className="relative group">
        <button className={`p-2 rounded-md ${active ? 'text-accent dark:text-white bg-accent/10 dark:bg-accent/20' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'}`}>
            {children}
        </button>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-dark-sidebar text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tooltip}
        </div>
    </div>
);


export const ActivityBar: React.FC = () => {
    const { t } = useAppContext();
    return (
        <aside className="w-12 bg-activity-bar dark:bg-dark-activity-bar flex-shrink-0 flex flex-col items-center py-2 border-r border-border dark:border-dark-border space-y-2">
            <IconWrapper active tooltip={t('activitybar.explorer')}>
                <Files className="w-6 h-6" />
            </IconWrapper>
            <IconWrapper tooltip={t('activitybar.search')}>
                <Search className="w-6 h-6" />
            </IconWrapper>
            <IconWrapper tooltip={t('activitybar.source_control')}>
                <GitBranch className="w-6 h-6" />
            </IconWrapper>
            <IconWrapper tooltip={t('activitybar.run_debug')}>
                <BugPlay className="w-6 h-6" />
            </IconWrapper>
            <IconWrapper tooltip={t('activitybar.extensions')}>
                <Package className="w-6 h-6" />
            </IconWrapper>
        </aside>
    );
};