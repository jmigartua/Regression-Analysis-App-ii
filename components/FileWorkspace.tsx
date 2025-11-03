
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';
import type { FileState } from '../types';

import { MainPanel } from './MainPanel';
import { SimulationPanel } from './SimulationPanel';

// A helper function for cloning the file state for simulation
const deepCloneFileState = (fileState: FileState): FileState => {
    const newId = `${fileState.id}-sim`;
    
    const cloned = {
        ...fileState,
        id: newId,
        data: JSON.parse(JSON.stringify(fileState.data)),
        analysisResult: fileState.analysisResult ? JSON.parse(JSON.stringify(fileState.analysisResult)) : null,
        selectedRowIndices: new Set(fileState.selectedRowIndices),
        uiState: {
            ...fileState.uiState,
            selectedPlotIndices: new Set(fileState.uiState.selectedPlotIndices),
            exportConfig: {
                ...fileState.uiState.exportConfig
            }
        },
        simulationState: null // prevent infinite recursion
    };
    return cloned;
};


export const FileWorkspace: React.FC = () => {
    const { t } = useAppContext();
    const { fileState, updateFileState } = useFileContext();

    if (!fileState) {
        return null; // or a placeholder
    }

    const { activeWorkspaceTab } = fileState;
    const setActiveTab = (tab: 'analysis' | 'simulation') => {
        if (tab === 'simulation' && !fileState.simulationState) {
            const newSimState = deepCloneFileState(fileState);
            updateFileState({ activeWorkspaceTab: tab, simulationState: newSimState });
        } else {
            updateFileState({ activeWorkspaceTab: tab });
        }
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