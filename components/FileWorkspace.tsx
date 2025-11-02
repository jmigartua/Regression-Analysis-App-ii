
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';

import { MainPanel } from './MainPanel';
import { SimulationPanel } from './SimulationPanel';

export const FileWorkspace: React.FC = () => {
    const { t } = useAppContext();
    const { fileState, updateFileState } = useFileContext();

    if (!fileState) {
        return null; // or a placeholder
    }

    const { activeWorkspaceTab } = fileState;
    const setActiveTab = (tab: 'analysis' | 'simulation') => {
        updateFileState({ activeWorkspaceTab: tab });
    };

    return (
        <div className="flex-grow flex flex-col overflow-hidden bg-panel dark:bg-dark-panel">
            <div className="flex-shrink-0 border-b border-border dark:border-dark-border px-2">
                 <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeWorkspaceTab === 'analysis' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('tabs.analysis_fitting')}
                </button>
                <button
                    onClick={() => setActiveTab('simulation')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeWorkspaceTab === 'simulation' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('tabs.simulation')}
                </button>
            </div>
            
            <div className="flex-grow overflow-hidden">
                 {activeWorkspaceTab === 'analysis' && fileState.data.length > 0 && <MainPanel />}
                 {activeWorkspaceTab === 'simulation' && <SimulationPanel />}
            </div>
        </div>
    );
};
