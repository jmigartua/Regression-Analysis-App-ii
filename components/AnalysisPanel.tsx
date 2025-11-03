
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { ResultsPanel } from './ResultsPanel';
import type { AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface AnalysisPanelProps {
  result: AnalysisResult;
  independentVar: string;
  dependentVar: string;
  sidebarPosition?: 'left' | 'right';
}

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

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border dark:border-dark-border">
      <button 
        className="flex items-center cursor-pointer px-2 py-2 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
          <ChevronDown className={`w-4 h-4 mr-2 flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}/>
          <h3 className="text-xs font-bold uppercase text-text-primary dark:text-gray-200 tracking-wider select-none">{title}</h3>
      </button>
      {isOpen && <div className="p-2 space-y-2">{children}</div>}
    </div>
  );
};

const FittingOption: React.FC<{ label: string; active?: boolean; disabled?: boolean; onClick?: () => void }> = ({ label, active, disabled, onClick }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center ${
            active 
                ? 'bg-accent/20 text-accent font-semibold' 
                : 'text-text-primary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {label}
    </button>
);


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, independentVar, dependentVar, sidebarPosition = 'left' }) => {
    const { t, theme } = useAppContext();
    const [activeTab, setActiveTab] = useState<'analysis' | 'residuals'>('analysis');
    const [decimalPoints, setDecimalPoints] = useState(4);
    
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
            <div className="flex-grow overflow-auto">
                {activeTab === 'analysis' && (
                     <div className={`flex h-full ${sidebarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-64 flex-shrink-0 bg-sidebar dark:bg-dark-sidebar overflow-y-auto ${sidebarPosition === 'right' ? 'border-l border-border dark:border-dark-border' : 'border-r border-border dark:border-dark-border'}`}>
                            <Section title={t('analysis.regression_type_title')}>
                                <FittingOption label={t('analysis.linear_regression')} active />
                                <FittingOption label={t('analysis.higher_order_regressions')} disabled />
                            </Section>

                             <Section title={t('analysis.regression_method_title')}>
                                <p className="text-xs text-text-tertiary px-2">{t('analysis.regression_method_placeholder')}</p>
                            </Section>

                            <Section title={t('analysis.controls_title')}>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="decimal-slider" className="text-sm text-text-secondary dark:text-gray-300 w-28 flex-shrink-0">{t('analysis.decimal_points')}:</label>
                                    <input
                                        id="decimal-slider"
                                        type="range"
                                        min="1"
                                        max="8"
                                        value={decimalPoints}
                                        onChange={(e) => setDecimalPoints(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-sm font-mono w-4 text-right">{decimalPoints}</span>
                                </div>
                            </Section>
                        </div>
                        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                            <ResultsPanel result={result} decimalPoints={decimalPoints} />
                            <div>
                                <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-2">{t('right_sidebar.equation')}</h3>
                                <div className="text-sm bg-bg-default dark:bg-dark-bg p-3 rounded font-mono break-words border border-border dark:border-dark-border">
                                    <span className="text-purple-500 dark:text-purple-400">{dependentVar}</span> = <span className="text-accent dark:text-accent">{result.intercept.toFixed(decimalPoints)}</span> + <span className="text-accent dark:text-accent">{result.slope.toFixed(decimalPoints)}</span> * <span className="text-green-500 dark:text-green-400">{independentVar}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'residuals' && (
                    <div className="w-full h-full min-h-[200px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis type="number" dataKey={independentVar} name={independentVar} stroke={tickColor} domain={['dataMin', 'dataMax']} />
                                <YAxis type="number" dataKey="residual" name={t('analysis.residual')} stroke={tickColor} />
                                <Tooltip content={<ResidualTooltip independentVar={independentVar} />} cursor={{ strokeDasharray: '3 3' }} />
                                <ReferenceLine y={0} stroke={theme === 'dark' ? '#f87171' : '#ef4444'} strokeDasharray="3 3" />
                                <Scatter name={t('analysis.residuals')} data={result.residualPlotData} fillOpacity={0.7} fill="#f97316" shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};