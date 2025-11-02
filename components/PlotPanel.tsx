
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ReferenceArea } from 'recharts';
import type { DataPoint, AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { PlotTool } from './PlotToolbar';

interface PlotPanelProps {
  data: DataPoint[];
  residualsData: DataPoint[];
  inactiveData: DataPoint[];
  unselectedData: DataPoint[];
  selectedData: DataPoint[];
  independentVar: string;
  dependentVar: string;
  analysisResult: AnalysisResult | null;
  
  // Interactivity props
  chartStateRef: React.MutableRefObject<any>;
  activeTool: PlotTool | null;
  xAxisDomain: [any, any];
  setXAxisDomain: (domain: [any, any]) => void;
  yAxisDomain: [any, any];
  setYAxisDomain: (domain: [any, any]) => void;
  selectedIndices: Set<number>;
  setSelectedIndices: (indices: Set<number>) => void;

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
    if (!analysisResult || !payload || !independentVar || !yAxis) return null;
    const { slope, intercept } = analysisResult;
    const xValue = payload[independentVar];
    if (typeof xValue !== 'number' || typeof slope !== 'number' || typeof intercept !== 'number') return null;
    const predictedY = intercept + slope * xValue;
    const predictedCy = yAxis.scale(predictedY);
    const strokeColor = `rgba(${hexToRgb(color)}, ${opacity})`;
    return <line x1={cx} y1={cy} x2={cx} y2={predictedCy} stroke={strokeColor} strokeWidth={width} strokeDasharray={getDashArray(style)} />;
};

export const PlotPanel: React.FC<PlotPanelProps> = ({ 
    data, residualsData, inactiveData, unselectedData, selectedData, independentVar, dependentVar, analysisResult,
    chartStateRef, activeTool, xAxisDomain, setXAxisDomain, yAxisDomain, setYAxisDomain, selectedIndices, setSelectedIndices,
    showGrid, showObservations, showLine, showResiduals,
    scatterColor, scatterOpacity, scatterSize,
    lineColor, lineOpacity, lineWidth, lineStyle,
    residualsColor, residualsOpacity, residualsWidth, residualsStyle
}) => {
    const { t, theme } = useAppContext();
    const [refArea, setRefArea] = useState<{ x1?: number, y1?: number, x2?: number, y2?: number }>({});
    const [panState, setPanState] = useState<{startX: number, startY: number, startDomainX: number[], startDomainY: number[] } | null>(null);
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
    const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';

    const handleMouseDown = (e: any) => {
        if (!e || !e.xValue || !e.yValue) return;
        chartStateRef.current = e;
        
        if (activeTool === 'select') {
            setRefArea({ x1: e.xValue, y1: e.yValue, x2: e.xValue, y2: e.yValue });
        } else if (activeTool === 'pan' && e.xAxisMap?.scale && e.yAxisMap?.scale) {
            const [xMin, xMax] = e.xAxisMap.scale.domain();
            const [yMin, yMax] = e.yAxisMap.scale.domain();
            setPanState({ startX: e.chartX, startY: e.chartY, startDomainX: [xMin, xMax], startDomainY: [yMin, yMax] });
        }
    };

    const handleMouseMove = (e: any) => {
        if (!e) return;
        chartStateRef.current = e;

        if (activeTool === 'select' && refArea.x1 !== undefined && e.xValue) {
            setRefArea(prev => ({ ...prev, x2: e.xValue, y2: e.yValue }));
        } else if (activeTool === 'pan' && panState && e.xAxisMap?.scale && e.yAxisMap?.scale) {
            const dx = e.chartX - panState.startX;
            const dy = e.chartY - panState.startY;

            const [xMin, xMax] = panState.startDomainX;
            const [yMin, yMax] = panState.startDomainY;
            
            const xRange = xMax - xMin;
            const yRange = yMax - yMin;

            const xPixelRange = e.xAxisMap.scale.range()[1] - e.xAxisMap.scale.range()[0];
            const yPixelRange = e.yAxisMap.scale.range()[0] - e.yAxisMap.scale.range()[1];

            if (Math.abs(xPixelRange) < 1 || Math.abs(yPixelRange) < 1) return;
            
            const newXMin = xMin - (dx * xRange) / xPixelRange;
            const newXMax = xMax - (dx * xRange) / xPixelRange;
            const newYMin = yMin + (dy * yRange) / yPixelRange;
            const newYMax = yMax + (dy * yRange) / yPixelRange;

            setXAxisDomain([newXMin, newXMax]);
            setYAxisDomain([newYMin, newYMax]);
        }
    };

    const handleMouseUp = () => {
        if (activeTool === 'select' && refArea.x1 !== undefined && refArea.x2 !== undefined) {
            const { x1, y1, x2, y2 } = refArea;
            const x_min = Math.min(x1!, x2!);
            const x_max = Math.max(x1!, x2!);
            const y_min = Math.min(y1!, y2!);
            const y_max = Math.max(y1!, y2!);
            
            const newSelectedIndices = new Set(selectedIndices);
            data.forEach((d, index) => {
                const x = d[independentVar];
                const y = d[dependentVar];
                if (x >= x_min && x <= x_max && y >= y_min && y <= y_max) {
                    newSelectedIndices.add(index);
                }
            });
            setSelectedIndices(newSelectedIndices);
        }
        setRefArea({});
        setPanState(null);
    };

    const scatterBaseSize = scatterSize * scatterSize / 20;

    return (
        <div className="w-full h-full" style={{ cursor: activeTool === 'pan' ? 'move' : activeTool === 'select' ? 'crosshair' : 'default' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart 
                    margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                    <XAxis type="number" dataKey={independentVar} name={independentVar} unit="" stroke={tickColor} domain={xAxisDomain} allowDataOverflow />
                    <YAxis type="number" dataKey={dependentVar} name={dependentVar} unit="" stroke={tickColor} domain={yAxisDomain} allowDataOverflow/>
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    
                    {showObservations && (
                        <>
                            <Scatter name="Inactive" data={inactiveData} fill="#9ca3af" fillOpacity={0.3} shape="circle" legendType="none" size={scatterBaseSize} />
                            <Scatter name={t('plot.observations')} data={unselectedData} fill={scatterColor} fillOpacity={scatterOpacity} shape="circle" legendType="circle" size={scatterBaseSize} />
                            <Scatter name="Selected" data={selectedData} fill="#f97316" fillOpacity={1} shape="circle" legendType="none" size={scatterBaseSize * 1.5} zIndex={100} />
                        </>
                    )}

                    {showResiduals && analysisResult && (
                        <Scatter isAnimationActive={false} data={residualsData} fill="transparent" shape={(props) => <ResidualLine {...props} independentVar={independentVar} analysisResult={analysisResult} color={residualsColor} opacity={residualsOpacity} width={residualsWidth} style={residualsStyle} />} key={`residuals-${residualsData.length}`} />
                    )}
                    
                    {analysisResult?.regressionLine && showLine && <Line name={t('plot.regression_line')} type="monotone" dataKey={dependentVar} data={analysisResult.regressionLine} stroke={lineColor} strokeOpacity={lineOpacity} dot={false} activeDot={false} strokeWidth={lineWidth} strokeDasharray={getDashArray(lineStyle)} legendType="line" />}

                    {refArea.x1 && refArea.x2 && (
                        <ReferenceArea x1={refArea.x1} x2={refArea.x2} y1={refArea.y1} y2={refArea.y2} strokeOpacity={0.3} stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                    )}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
