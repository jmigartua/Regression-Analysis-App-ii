
import React from 'react';
import { X } from 'lucide-react';
import type { FileState } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface FileTabsProps {
  files: Record<string, FileState>;
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export const FileTabs: React.FC<FileTabsProps> = ({ files, activeFileId, onSelectTab, onCloseTab }) => {
    const { t } = useAppContext();
    const fileList = Object.values(files);

    if (fileList.length === 0) {
        return null;
    }

    return (
        <div className="flex-shrink-0 bg-sidebar dark:bg-dark-sidebar border-b border-border dark:border-dark-border">
            <div className="flex items-center">
                {fileList.map((file: FileState) => (
                    <div
                        key={file.id}
                        onClick={() => onSelectTab(file.id)}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer border-r border-border dark:border-dark-border text-sm whitespace-nowrap ${
                            activeFileId === file.id
                                ? 'bg-panel dark:bg-dark-panel text-text-primary dark:text-white'
                                : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                    >
                        <span className="truncate max-w-xs">{file.file.name}</span>
                        <div className="relative group">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseTab(file.id);
                                }}
                                className="ml-3 p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/20"
                                aria-label={t('tabs.close_tab_tooltip')}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-sidebar text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                {t('tabs.close_tab_tooltip')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
