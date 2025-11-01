
import React, { useState } from 'react';
import { BarChart2, Database, Download } from 'lucide-react';
import { PlotPanel } from './PlotPanel';
import { DataTable } from './DataTable';
import { ResultsPanel } from './ResultsPanel';
import type { AnalysisResult, DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AnalysisReportProps {
    result: AnalysisResult;
    data: DataPoint[];
    combinedData: any[];
    independentVar: string;
    dependentVar: string;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ result, data, combinedData, independentVar, dependentVar }) => {
    const { t } = useAppContext();
    const [currentView, setCurrentView] = useState<'plot' | 'data'>('plot');

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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-text-primary dark:text-white">Analysis Report</h2>
                <button 
                    onClick={handleExport}
                    className="bg-brand-secondary hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                    <Download className="mr-2 h-5 w-5" />
                    Export Report
                </button>
            </div>
            
            <ResultsPanel result={result} />
            
            <div className="bg-sidebar dark:bg-slate-800 p-6 rounded-lg shadow-xl mt-8">
                <div className="flex border-b border-border dark:border-slate-700 mb-4">
                    <button onClick={() => setCurrentView('plot')} className={`px-4 py-2 font-medium transition-colors ${currentView === 'plot' ? 'border-b-2 border-brand-primary text-text-primary dark:text-white' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'}`}><BarChart2 className="inline-block mr-2 h-5 w-5"/>Visualizations</button>
                    <button onClick={() => setCurrentView('data')} className={`px-4 py-2 font-medium transition-colors ${currentView === 'data' ? 'border-b-2 border-brand-primary text-text-primary dark:text-white' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'}`}><Database className="inline-block mr-2 h-5 w-5"/>Data Table</button>
                </div>
                {currentView === 'plot' ? (
                    <PlotPanel 
                        data={data} 
                        combinedData={combinedData} 
                        regressionLine={result.regressionLine} 
                        independentVar={independentVar} 
                        dependentVar={dependentVar} />
                ) : (
                    <DataTable data={combinedData.slice(0, 100)} />
                )}
            </div>
        </div>
    );
};
