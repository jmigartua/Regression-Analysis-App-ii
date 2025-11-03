

import React, { useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { DataPoint, AnalysisResult, UIState } from '../types';
import { useAppContext } from '../contexts/AppContext';

// This mirrors the props of PlotPanel for compatibility
interface PlotlyPanelProps {
  data: DataPoint[];
  residualsData: DataPoint[];
  activeData: DataPoint[];
  independentVar: string;
  dependentVar: string;
  analysisResult: AnalysisResult | null;

  // Interactivity props from UIState
  xAxisDomain: UIState['xAxisDomain'];
  setXAxisDomain: (domain: [any, any]) => void;
  yAxisDomain: UIState['yAxisDomain'];
  setYAxisDomain: (domain: [any, any]) => void;
  onAnalysisSelectionChange: (indices: Set<number>) => void;
  onResetView: () => void;
  totalDataPoints: number;
  selectedRowIndices: Set<number>;
  uiRevision?: number;

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
  showLegend: boolean;
  showTitle: boolean;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

const getDashStyle = (style: string) => {
    switch (style) {
        case 'dashed': return 'dash';
        case 'dotted': return 'dot';
        default: return 'solid';
    }
}


export const PlotlyPanel: React.FC<PlotlyPanelProps> = (props) => {
    const { 
        data, activeData, independentVar, dependentVar, analysisResult,
        xAxisDomain, setXAxisDomain, yAxisDomain, setYAxisDomain, onAnalysisSelectionChange, onResetView, totalDataPoints, selectedRowIndices,
        uiRevision,
        showGrid,
        showObservations, showLine, showResiduals,
        scatterColor, scatterOpacity, scatterSize,
        lineColor, lineOpacity, lineWidth, lineStyle,
        residualsColor, residualsOpacity, residualsWidth, residualsStyle,
        showLegend, showTitle, title, xAxisLabel, yAxisLabel
    } = props;
    
    const { t, theme } = useAppContext();

    const traces = useMemo<Data[]>(() => {
        const generatedTraces: Data[] = [];

        if (showObservations) {
            const selectedPointIndices: number[] = [];
            selectedRowIndices.forEach(index => {
                if(index < data.length) {
                    selectedPointIndices.push(index);
                }
            });

             generatedTraces.push({
                type: 'scatter',
                mode: 'markers',
                x: data.map(d => d[independentVar]),
                y: data.map(d => d[dependentVar]),
                name: t('plot.observations'),
                customdata: data.map((d, i) => i),
                selectedpoints: selectedPointIndices,
                marker: {
                    color: scatterColor,
                    opacity: scatterOpacity,
                    size: scatterSize / 4
                },
                selected: {
                    marker: { opacity: 1.0 }
                },
                unselected: {
                    marker: { opacity: 0.3, color: '#9ca3af' }
                }
            });
        }

        if (analysisResult?.regressionLine && showLine) {
            generatedTraces.push({
                type: 'scatter',
                mode: 'lines',
                x: analysisResult.regressionLine.map(d => d[independentVar]),
                y: analysisResult.regressionLine.map(d => d[dependentVar]),
                name: t('plot.regression_line'),
                line: { 
                    color: lineColor, 
                    width: lineWidth,
                    dash: getDashStyle(lineStyle)
                },
                opacity: lineOpacity
            });
        }
        return generatedTraces;
    }, [
        data, selectedRowIndices, independentVar, dependentVar, analysisResult, showObservations, showLine,
        scatterColor, scatterOpacity, scatterSize, lineColor, lineOpacity, lineWidth, lineStyle, t
    ]);

    const layout = useMemo<Partial<Layout>>(() => {
        const isDark = theme === 'dark';
        
        const shapes = (showResiduals && analysisResult && typeof analysisResult.slope === 'number' && typeof analysisResult.intercept === 'number')
            ? props.residualsData
                .map(d => {
                    const xVal = d[independentVar];
                    const yVal = d[dependentVar];

                    if (typeof xVal !== 'number' || !isFinite(xVal) || typeof yVal !== 'number' || !isFinite(yVal)) {
                        return null;
                    }

                    const predictedY = analysisResult.intercept + analysisResult.slope * xVal;

                    if (!isFinite(predictedY)) {
                        return null;
                    }

                    return {
                        type: 'line' as const,
                        x0: xVal,
                        y0: yVal,
                        x1: xVal,
                        y1: predictedY,
                        line: {
                            color: residualsColor,
                            width: residualsWidth,
                            dash: getDashStyle(residualsStyle),
                        },
                        opacity: residualsOpacity,
                    };
                })
                .filter((shape): shape is NonNullable<typeof shape> => shape !== null)
            : [];


        return {
            uirevision: uiRevision,
            title: showTitle ? { text: title, font: { color: isDark ? '#e5e7eb' : '#1f2937' } } : undefined,
            xaxis: {
                title: { text: xAxisLabel },
                range: xAxisDomain.includes('auto') ? undefined : [...xAxisDomain],
                autorange: xAxisDomain.includes('auto') ? true : undefined,
                gridcolor: isDark ? '#334155' : '#e5e7eb',
                showgrid: showGrid,
                linecolor: isDark ? '#475569' : '#d1d5db',
                tickfont: { color: isDark ? '#94a3b8' : '#6b7280' },
                titlefont: { color: isDark ? '#cbd5e1' : '#4b5563' },
            },
            yaxis: {
                title: { text: yAxisLabel },
                range: yAxisDomain.includes('auto') ? undefined : [...yAxisDomain],
                autorange: yAxisDomain.includes('auto') ? true : undefined,
                gridcolor: isDark ? '#334155' : '#e5e7eb',
                showgrid: showGrid,
                linecolor: isDark ? '#475569' : '#d1d5db',
                tickfont: { color: isDark ? '#94a3b8' : '#6b7280' },
                titlefont: { color: isDark ? '#cbd5e1' : '#4b5563' },
            },
            showlegend: showLegend,
            legend: {
                font: { color: isDark ? '#94a3b8' : '#6b7280' },
            },
            paper_bgcolor: isDark ? '#282c34' : '#ffffff',
            plot_bgcolor: isDark ? '#282c34' : '#ffffff',
            margin: { l: 60, r: 20, t: showTitle ? 40 : 20, b: 50 },
            shapes,
            dragmode: 'lasso', // Or 'select' for box selection. Lets Plotly toolbar control this.
        };
    }, [
        theme, title, showTitle, xAxisLabel, yAxisLabel, xAxisDomain, yAxisDomain, showLegend, showGrid,
        showResiduals, analysisResult, props.residualsData, independentVar, dependentVar, residualsColor, residualsWidth, residualsStyle, residualsOpacity,
        uiRevision
    ]);
    
    const handleRelayout = useCallback((eventData: any) => {
        if (eventData['xaxis.range[0]'] !== undefined) {
            const newXDomain: [number, number] = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
            if (Math.abs(newXDomain[0] - xAxisDomain[0]) > 1e-6 || Math.abs(newXDomain[1] - xAxisDomain[1]) > 1e-6) {
                setXAxisDomain(newXDomain);
            }
        }
        if (eventData['yaxis.range[0]'] !== undefined) {
            const newYDomain: [number, number] = [eventData['yaxis.range[0]'], eventData['yaxis.range[1]']];
            if (Math.abs(newYDomain[0] - yAxisDomain[0]) > 1e-6 || Math.abs(newYDomain[1] - yAxisDomain[1]) > 1e-6) {
                setYAxisDomain(newYDomain);
            }
        }
        if (eventData['xaxis.autorange']) {
            onResetView();
        }
    }, [xAxisDomain, yAxisDomain, setXAxisDomain, setYAxisDomain, onResetView]);

    const handleSelection = useCallback((eventData: any) => {
        // This handler is now specifically for when a selection is actively made.
        // It ignores empty selection events which Plotly can fire on mouse-up,
        // preventing the analysis from incorrectly resetting to all data points.
        if (eventData && eventData.points && eventData.points.length > 0) {
            const newSelectedIndices = new Set<number>();
            eventData.points.forEach((point: any) => {
                if (point.customdata !== undefined) {
                    newSelectedIndices.add(point.customdata);
                }
            });
            onAnalysisSelectionChange(newSelectedIndices);
        }
    }, [onAnalysisSelectionChange]);

    const handleDeselect = useCallback(() => {
        // This handler is for when the user actively clears a selection (e.g., by double-clicking).
        // In this case, we want to revert the analysis to include all data points.
        const allIndices = new Set(Array.from({ length: totalDataPoints }, (_, i) => i));
        onAnalysisSelectionChange(allIndices);
    }, [totalDataPoints, onAnalysisSelectionChange]);


    return (
        <Plot
            data={traces}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true, displaylogo: false }}
            onRelayout={handleRelayout}
            onSelected={handleSelection}
            onDeselect={handleDeselect}
        />
    );
};
