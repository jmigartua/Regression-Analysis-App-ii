
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
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
    <label onClick={(e) => { e.preventDefault(); onChange(!checked); }} className="flex items-center space-x-2 cursor-pointer select-none">
        <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
        <span className="text-sm text-text-secondary dark:text-gray-300">{label}</span>
    </label>
);

const ResidualTooltip: React.FC<{ active?: boolean; payload?: any[]; independentVar: string; }> = ({ active, payload, independentVar }) => {
    const { t } = useAppContext();
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-panel dark:bg-slate-900/80 p-3 border border-border dark:border-slate-700 rounded-md text-sm">
                <p className="label text-text-primary dark:text-white">{`${independentVar} : ${dataPoint[independentVar]}`}</p>
                <p className="label text-text-primary dark:text-white">{`${t('analysis.residual')} : ${dataPoint.residual.toFixed(4)}`}</p>
            </div>
        );
    }
    return null;
};


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, independentVar, dependentVar, showGrid, onToggleGrid, showLine, onToggleLine }) => {
    const { t, theme } = useAppContext();
    const [activeTab, setActiveTab] = useState<'analysis' | 'residuals'>('analysis');
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
    const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 border-b border-border dark:border-dark-border px-2">
                 <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === 'analysis' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('analysis.tab_analysis')}
                </button>
                <button
                    onClick={() => setActiveTab('residuals')}
                    className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === 'residuals' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
                >
                    {t('analysis.tab_residuals')}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                {activeTab === 'analysis' && (
                     <div className="flex space-x-8">
                        <div className="flex-shrink-0 w-64">
                            <ResultsPanel result={result} />
                        </div>
                        <div className="flex-grow space-y-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-3">{t('plot.controls_title')}</h3>
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
                )}
                {activeTab === 'residuals' && (
                    <div className="w-full h-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis type="number" dataKey={independentVar} name={independentVar} stroke={tickColor} domain={['dataMin', 'dataMax']} />
                                <YAxis type="number" dataKey="residual" name={t('analysis.residual')} stroke={tickColor} />
                                <Tooltip content={<ResidualTooltip independentVar={independentVar} />} cursor={{ strokeDasharray: '3 3' }} />
                                <ReferenceLine y={0} stroke={theme === 'dark' ? '#f87171' : '#ef4444'} strokeDasharray="3 3" />
                                <Scatter name={t('analysis.residuals')} data={result.residualPlotData} fillOpacity={0.6} fill="#8884d8" shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};