
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import type { DataPoint, AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface PlotPanelProps {
  data: DataPoint[];
  regressionLine?: DataPoint[];
  independentVar: string;
  dependentVar: string;
  showGrid: boolean;
  showLine: boolean;
  showResiduals: boolean;
  analysisResult: AnalysisResult | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useAppContext();
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel dark:bg-slate-900/80 p-3 border border-border dark:border-slate-700 rounded-md text-sm">
        {payload[0].dataKey && <p className="label text-text-primary dark:text-white">{`${payload[0].name} : ${payload[0].value}`}</p>}
        {payload[1]?.dataKey && <p className="label text-text-primary dark:text-white">{`${payload[1].name} : ${payload[1].value}`}</p>}
      </div>
    );
  }
  return null;
};

const ResidualLine = (props: any) => {
    const { cx, cy, yAxis, payload, independentVar, analysisResult } = props;

    if (!analysisResult || !payload || !independentVar || !yAxis) {
        return null;
    }
    
    const { slope, intercept } = analysisResult;
    const xValue = payload[independentVar];
    
    if (typeof xValue !== 'number' || typeof slope !== 'number' || typeof intercept !== 'number') {
        return null;
    }

    const predictedY = intercept + slope * xValue;
    const predictedCy = yAxis.scale(predictedY);

    return (
        <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={predictedCy}
            stroke="rgba(239, 68, 68, 0.5)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
        />
    );
};

export const PlotPanel: React.FC<PlotPanelProps> = ({ data, regressionLine, independentVar, dependentVar, showGrid, showLine, showResiduals, analysisResult }) => {
    const { t, theme } = useAppContext();
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
    const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                    <XAxis type="number" dataKey={independentVar} name={independentVar} unit="" stroke={tickColor} domain={['dataMin', 'dataMax']} />
                    <YAxis type="number" dataKey={dependentVar} name={dependentVar} unit="" stroke={tickColor} domain={['dataMin', 'dataMax']} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name={t('plot.observations')} data={data} fill="#4f46e5" shape="circle" />
                    {showResiduals && analysisResult && (
                        <Scatter
                            isAnimationActive={false}
                            data={data}
                            shape={(props) => <ResidualLine {...props} independentVar={independentVar} analysisResult={analysisResult} />}
                            key={`residuals-${data.length}`} 
                        />
                    )}
                    {regressionLine && showLine && <Line
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
            </ResponsiveContainer>
        </div>
    );
};
