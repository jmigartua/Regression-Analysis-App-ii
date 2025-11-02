import React from 'react';
import type { AnalysisResult, DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

import { MainPanel } from './MainPanel';
import { SimulationPanel } from './SimulationPanel';

// Define MainPanel's props to be passed through
interface MainPanelProps {
    isPlotted: boolean;
    analysisResult: AnalysisResult | null;
    data: DataPoint[];
    selectedRowIndices: Set<number>;
    independentVar: string;
    dependentVar: string;
    onCellChange: (rowIndex: number, column: string, value: any) => void;
    onColumnRename: (oldName: string, newName:string) => void;
    onAddColumn: () => void;
    onDeleteColumn: (columnName: string) => void;
    onAddRow: () => void;
    onDeleteRow: (rowIndex: number) => void;
    onDeleteSelectedRows: () => void;
    onRowSelectionChange: (rowIndex: number, isSelected: boolean) => void;
    onSelectAllRows: (selectAll: boolean) => void;
}

interface FileWorkspaceProps extends MainPanelProps {
    activeTab: 'analysis' | 'simulation';
    setActiveTab: (tab: 'analysis' | 'simulation') => void;
}

export const FileWorkspace: React.FC<FileWorkspaceProps> = (props) => {
    const { t } = useAppContext();
    const { activeTab, setActiveTab, ...mainPanelProps } = props;

    return (
        <div className="flex-grow flex flex-col overflow-hidden bg-panel dark:bg-dark-panel">
            <div className="flex-shrink-0 border-b border-border dark:border-dark-border px-2">
                 <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === 'analysis' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('tabs.analysis_fitting')}
                </button>
                <button
                    onClick={() => setActiveTab('simulation')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === 'simulation' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('tabs.simulation')}
                </button>
            </div>
            
            <div className="flex-grow overflow-hidden">
                 {activeTab === 'analysis' && mainPanelProps.data.length > 0 && <MainPanel {...mainPanelProps} />}
                 {activeTab === 'simulation' && <SimulationPanel />}
            </div>
        </div>
    );
};
