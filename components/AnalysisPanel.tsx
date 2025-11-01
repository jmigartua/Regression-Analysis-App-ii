
import React from 'react';
import { ResultsPanel } from './ResultsPanel';
import type { AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AnalysisPanelProps {
  result: AnalysisResult;
  independentVar: string;
  dependentVar: string;
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  showLine: boolean;
  onToggleLine: (show: boolean) => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer select-none">
        <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
        <span className="text-sm text-text-secondary dark:text-gray-300">{label}</span>
    </label>
);


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, independentVar, dependentVar, showGrid, onToggleGrid, showLine, onToggleLine }) => {
    const { t } = useAppContext();

    return (
        <div className="h-full overflow-y-auto p-4 flex space-x-8">
            <div className="flex-shrink-0 w-64">
                <ResultsPanel result={result} />
            </div>
            <div className="flex-grow space-y-4">
                <div>
                    <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-3">{t('plot.controls_title', {
        defaultValue: 'Plot Controls'
      })}</h3>
                    <div className="flex space-x-6">
                        <Toggle label={t('analysis.show_grid')} checked={showGrid} onChange={onToggleGrid} />
                        <Toggle label={t('analysis.show_line')} checked={showLine} onChange={onToggleLine} />
                    </div>
                </div>
                 <div>
                  <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-2">{t('right_sidebar.equation')}</h3>
                  <div className="text-sm bg-bg-default dark:bg-dark-bg p-3 rounded font-mono break-words border border-border dark:border-dark-border">
                    <span className="text-purple-500 dark:text-purple-400">{dependentVar}</span> = <span className="text-accent dark:text-accent">{result.intercept.toFixed(4)}</span> + <span className="text-accent dark:text-accent">{result.slope.toFixed(4)}</span> * <span className="text-green-500 dark:text-green-400">{independentVar}</span>
                  </div>
                </div>
            </div>
        </div>
    );
};
