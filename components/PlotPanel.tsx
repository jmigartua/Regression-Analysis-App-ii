
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import type { DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface PlotPanelProps {
  data: DataPoint[];
  combinedData: any[];
  regressionLine: { x: number; y: number }[];
  independentVar: string;
  dependentVar: string;
}

type PlotType = 'regression' | 'residual';

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useAppContext();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-panel dark:bg-slate-900/80 p-3 border border-border dark:border-slate-700 rounded-md text-sm">
        {payload[0].dataKey && <p className="label text-text-primary dark:text-white">{`${payload[0].name} : ${payload[0].value}`}</p>}
        {payload[1]?.dataKey && <p className="label text-text-primary dark:text-white">{`${payload[1].name} : ${payload[1].value}`}</p>}
        <p className="text-text-secondary dark:text-slate-400">{t('tooltip.residual')}: {data.residual?.toFixed(4)}</p>
      </div>
    );
  }
  return null;
};

export const PlotPanel: React.FC<PlotPanelProps> = ({ data, combinedData, regressionLine, independentVar, dependentVar }) => {
    const { t, theme } = useAppContext();
    const [activePlot, setActivePlot] = useState<PlotType>('regression');
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
    const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';

    return (
        <div>
            <div className="flex justify-center space-x-2 mb-4">
                <button onClick={() => setActivePlot('regression')} className={`px-4 py-2 text-sm rounded-md ${activePlot === 'regression' ? 'bg-brand-primary text-white' : 'bg-sidebar dark:bg-slate-700 hover:bg-black/10 dark:hover:bg-slate-600'}`}>{t('plot.regression')}</button>
                <button onClick={() => setActivePlot('residual')} className={`px-4 py-2 text-sm rounded-md ${activePlot === 'residual' ? 'bg-brand-primary text-white' : 'bg-sidebar dark:bg-slate-700 hover:bg-black/10 dark:hover:bg-slate-600'}`}>{t('plot.residual')}</button>
            </div>
            <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    {activePlot === 'regression' ? (
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" dataKey={independentVar} name={independentVar} unit="" stroke={tickColor} domain={['dataMin', 'dataMax']} />
                            <YAxis type="number" dataKey={dependentVar} name={dependentVar} unit="" stroke={tickColor} domain={['dataMin', 'dataMax']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter name={t('plot.observations')} data={data} fill="#4f46e5" shape="circle" />
                            {regressionLine && regressionLine.length > 0 && <Line
                                name={t('plot.regression_line')}
                                type="monotone"
                                dataKey="y"
                                data={regressionLine}
                                stroke="#10b981"
                                dot={false}
                                activeDot={false}
                                strokeWidth={2}
                                legendType="line"
                            />}
                        </ScatterChart>
                    ) : (
                         <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" dataKey="predicted" name={t('plot.predicted_values')} stroke={tickColor} domain={['dataMin', 'dataMax']} />
                            <YAxis type="number" dataKey="residual" name={t('plot.residuals')} stroke={tickColor} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Legend />
                            <Scatter name={t('plot.residuals')} data={combinedData} fill="#f43f5e" />
                            <Line type="monotone" dataKey={v => 0} data={combinedData} stroke={tickColor} dot={false} strokeDasharray="5 5" name="Zero line" />
                        </ScatterChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
