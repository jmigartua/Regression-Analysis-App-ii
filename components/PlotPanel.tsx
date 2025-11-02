
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import type { DataPoint, AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface PlotPanelProps {
  data: DataPoint[];
  independentVar: string;
  dependentVar: string;
  analysisResult: AnalysisResult | null;
  
  // Style props
  showGrid: boolean;
  showObservations: boolean;
  showLine: boolean;
  showResiduals: boolean;

  scatterColor: string;
  scatterOpacity: number;
  scatterSize: number;

  lineColor: string;
  lineOpacity: number;
  lineWidth: number;
  lineStyle: string;

  residualsColor: string;
  residualsOpacity: number;
  residualsWidth: number;
  residualsStyle: string;
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

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const getDashArray = (style: string) => {
    switch (style) {
        case 'dashed': return '5 5';
        case 'dotted': return '1 5';
        default: return 'none';
    }
}

const ResidualLine = (props: any) => {
    const { cx, cy, yAxis, payload, independentVar, analysisResult, color, opacity, width, style } = props;

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
    const strokeColor = `rgba(${hexToRgb(color)}, ${opacity})`;

    return (
        <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={predictedCy}
            stroke={strokeColor}
            strokeWidth={width}
            strokeDasharray={getDashArray(style)}
        />
    );
};

export const PlotPanel: React.FC<PlotPanelProps> = ({ 
    data, 
    independentVar, 
    dependentVar, 
    analysisResult,
    showGrid,
    showObservations,
    showLine,
    showResiduals,
    scatterColor,
    scatterOpacity,
    scatterSize,
    lineColor,
    lineOpacity,
    lineWidth,
    lineStyle,
    residualsColor,
    residualsOpacity,
    residualsWidth,
    residualsStyle
}) => {
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
                    {showObservations && <Scatter 
                        name={t('plot.observations')} 
                        data={data} 
                        fill={scatterColor} 
                        fillOpacity={scatterOpacity}
                        shape="circle" 
                        legendType="circle"
                        // Recharts 'size' is area, so we square root to make slider feel linear
                        // Then multiply to get a good range.
                        size={scatterSize * scatterSize / 20}
                    />}
                    {showResiduals && analysisResult && (
                        <Scatter
                            isAnimationActive={false}
                            data={data}
                            shape={(props) => <ResidualLine 
                                {...props} 
                                independentVar={independentVar} 
                                analysisResult={analysisResult}
                                color={residualsColor}
                                opacity={residualsOpacity}
                                width={residualsWidth}
                                style={residualsStyle}
                            />}
                            key={`residuals-${data.length}`} 
                        />
                    )}
                    {analysisResult?.regressionLine && showLine && <Line
                        name={t('plot.regression_line')}
                        type="monotone"
                        dataKey="y"
                        data={analysisResult.regressionLine}
                        stroke={lineColor}
                        strokeOpacity={lineOpacity}
                        dot={false}
                        activeDot={false}
                        strokeWidth={lineWidth}
                        strokeDasharray={getDashArray(lineStyle)}
                        legendType="line"
                    />}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
