
import React from 'react';
import { Download } from 'lucide-react';
import { ResultsPanel } from './ResultsPanel';
import type { AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface RightSidebarProps {
    result: AnalysisResult;
    independentVar: string;
    dependentVar: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ result, independentVar, dependentVar }) => {
    const { t } = useAppContext();
    const handleExport = () => {
        const reportParts = [
            'Linear Regression Analysis Report',
            '===================================',
            '',
            'Summary Statistics:',
            `R-Squared: ${result.rSquared.toFixed(6)}`,
            `Standard Error: ${result.stdErr.toFixed(6)}`,
            '',
            'Coefficients:',
            `Slope (β₁): ${result.slope.toFixed(6)} (p-value: ${result.p_value_slope.toFixed(6)})`,
            `Intercept (β₀): ${result.intercept.toFixed(6)} (p-value: ${result.p_value_intercept.toFixed(6)})`,
            '',
            `Regression Equation: ${dependentVar} = ${result.intercept.toFixed(4)} + ${result.slope.toFixed(4)} * ${independentVar}`,
        ];
        
        const reportText = reportParts.join('\n');
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'analysis-report.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <aside className="w-full h-full bg-sidebar dark:bg-dark-sidebar flex-shrink-0 p-4 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase text-text-primary dark:text-gray-200">{t('right_sidebar.analysis')}</h3>
                <button 
                    onClick={handleExport}
                    className="flex items-center bg-bg-default dark:bg-dark-bg hover:bg-black/5 dark:hover:bg-gray-800 text-text-secondary dark:text-gray-300 font-semibold py-1 px-2 border border-border dark:border-dark-border rounded-md text-xs"
                >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {t('right_sidebar.export')}
                </button>
            </div>
            
            <ResultsPanel result={result} />

            <div>
              <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-2">{t('right_sidebar.equation')}</h3>
              <div className="text-sm bg-bg-default dark:bg-dark-bg p-3 rounded font-mono break-words">
                <span className="text-purple-500 dark:text-purple-400">{dependentVar}</span> = <span className="text-accent dark:text-accent">{result.intercept.toFixed(4)}</span> + <span className="text-accent dark:text-accent">{result.slope.toFixed(4)}</span> * <span className="text-green-500 dark:text-green-400">{independentVar}</span>
              </div>
            </div>
        </aside>
    );
};
