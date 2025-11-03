
import React, { useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { DataPoint, AnalysisResult, UIState } from '../types';
import { useAppContext } from '../contexts/AppContext';

// This mirrors the props of PlotPanel for compatibility
interface PlotlyPanelProps {
  data: DataPoint[];
  residualsData: DataPoint[];
  inactiveData: DataPoint[];
  unselectedData: DataPoint[];
  selectedData: DataPoint[];
  independentVar: string;
  dependentVar: string;
  analysisResult: AnalysisResult | null;

  // Interactivity props from UIState
  activeTool: UIState['activePlotTool'];
  xAxisDomain: UIState['xAxisDomain'];
  setXAxisDomain: (domain: [any, any]) => void;
  yAxisDomain: UIState['yAxisDomain'];
  setYAxisDomain: (domain: [any, any]) => void;
  selectedIndices: UIState['selectedPlotIndices'];
  setSelectedIndices: (indices: Set<number>) => void;

  // Style props
  // FIX: Added missing showGrid prop to allow controlling grid visibility.
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
        data, inactiveData, unselectedData, selectedData, independentVar, dependentVar, analysisResult,
        activeTool, xAxisDomain, setXAxisDomain, yAxisDomain, setYAxisDomain, selectedIndices, setSelectedIndices,
        showGrid,
        showObservations, showLine, showResiduals,
        scatterColor, scatterOpacity, scatterSize,
        lineColor, lineOpacity, lineWidth, lineStyle,
        residualsColor, residualsOpacity, residualsWidth, residualsStyle,
        showLegend, showTitle, title, xAxisLabel, yAxisLabel
    } = props;
    
    const { t, theme } = useAppContext();
    const dataPointToOriginalIndex = useMemo(() => new Map(data.map((d, i) => [d, i])), [data]);

    const traces = useMemo<Data[]>(() => {
        const generatedTraces: Data[] = [];

        if (showObservations) {
             generatedTraces.push({
                type: 'scatter',
                mode: 'markers',
                x: inactiveData.map(d => d[independentVar]),
                y: inactiveData.map(d => d[dependentVar]),
                name: 'Inactive',
                legendgroup: 'observations',
                showlegend: false,
                marker: { color: '#9ca3af', opacity: 0.3, size: scatterSize / 4 },
                hoverinfo: 'none',
            });
            generatedTraces.push({
                type: 'scatter',
                mode: 'markers',
                x: unselectedData.map(d => d[independentVar]),
                y: unselectedData.map(d => d[dependentVar]),
                name: t('plot.observations'),
                customdata: unselectedData.map(d => dataPointToOriginalIndex.get(d)),
                legendgroup: 'observations',
                marker: { color: scatterColor, opacity: scatterOpacity, size: scatterSize / 4 },
            });
             generatedTraces.push({
                type: 'scatter',
                mode: 'markers',
                x: selectedData.map(d => d[independentVar]),
                y: selectedData.map(d => d[dependentVar]),
                name: 'Selected',
                customdata: selectedData.map(d => dataPointToOriginalIndex.get(d)),
                legendgroup: 'observations',
                showlegend: false,
                marker: { color: '#f97316', opacity: 1, size: scatterSize / 3, symbol: 'circle' },
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
        inactiveData, unselectedData, selectedData, independentVar, dependentVar, analysisResult, showObservations, showLine,
        scatterColor, scatterOpacity, scatterSize, lineColor, lineOpacity, lineWidth, lineStyle, t, dataPointToOriginalIndex
    ]);

    const layout = useMemo<Partial<Layout>>(() => {
        const isDark = theme === 'dark';
        const shapes = showResiduals && analysisResult ? props.residualsData.map(d => {
            const predictedY = analysisResult.intercept + analysisResult.slope * d[independentVar];
            return {
                type: 'line' as const,
                x0: d[independentVar],
                y0: d[dependentVar],
                x1: d[independentVar],
                y1: predictedY,
                line: {
                    color: residualsColor,
                    width: residualsWidth,
                    dash: getDashStyle(residualsStyle),
                },
                opacity: residualsOpacity,
            }
        }) : [];

        return {
            title: showTitle ? { text: title, font: { color: isDark ? '#e5e7eb' : '#1f2937' } } : undefined,
            xaxis: {
                title: { text: xAxisLabel },
                range: xAxisDomain.includes('auto') ? undefined : xAxisDomain,
                autorange: xAxisDomain.includes('auto') ? true : undefined,
                gridcolor: isDark ? '#334155' : '#e5e7eb',
                showgrid: showGrid,
                linecolor: isDark ? '#475569' : '#d1d5db',
                tickfont: { color: isDark ? '#94a3b8' : '#6b7280' },
                titlefont: { color: isDark ? '#cbd5e1' : '#4b5563' },
            },
            yaxis: {
                title: { text: yAxisLabel },
                range: yAxisDomain.includes('auto') ? undefined : yAxisDomain,
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
            dragmode: activeTool === 'pan' ? 'pan' : activeTool === 'select' ? 'select' : 'zoom',
            paper_bgcolor: isDark ? '#282c34' : '#ffffff',
            plot_bgcolor: isDark ? '#282c34' : '#ffffff',
            margin: { l: 60, r: 20, t: showTitle ? 40 : 20, b: 50 },
            shapes,
        };
    }, [
        theme, title, showTitle, xAxisLabel, yAxisLabel, xAxisDomain, yAxisDomain, showLegend, activeTool, showGrid,
        showResiduals, analysisResult, props.residualsData, independentVar, residualsColor, residualsWidth, residualsStyle, residualsOpacity
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
    }, [xAxisDomain, yAxisDomain, setXAxisDomain, setYAxisDomain]);

    const handleSelected = useCallback((eventData: any) => {
        if (eventData && eventData.points) {
            const newSelectedIndices = new Set(selectedIndices);
            eventData.points.forEach((point: any) => {
                if (point.customdata !== undefined) {
                    newSelectedIndices.add(point.customdata);
                }
            });
            setSelectedIndices(newSelectedIndices);
        }
    }, [selectedIndices, setSelectedIndices]);

    return (
        <Plot
            data={traces}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'pan2d'] }}
            onRelayout={handleRelayout}
            onSelected={handleSelected}
        />
    );
};
