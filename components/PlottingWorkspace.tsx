import React, { useRef, useCallback, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { PlotPanel } from './PlotPanel';
import { PlotlyPanel } from './PlotlyPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { PlotExplorerPanel } from './PlotExplorerPanel';
import { PlotToolbar } from './PlotToolbar';
import type { DataPoint, UIState, FileState } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { getPaddedDomain } from '../utils/regression';

const PlotPlaceholder: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <BarChart2 className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.plot_placeholder_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.plot_placeholder_description')}</p>
    </div>
)};

interface PlottingWorkspaceProps {
    fileState: FileState;
    updateFileState: (updates: Partial<FileState>) => void;
    explorerPosition: 'left' | 'right';
    isReadOnly?: boolean;
    analysisSidebarPosition?: 'left' | 'right';
    forceRenderer?: 'recharts' | 'plotly';
}

export const PlottingWorkspace: React.FC<PlottingWorkspaceProps> = ({ fileState, updateFileState, explorerPosition, isReadOnly = false, analysisSidebarPosition = 'left', forceRenderer }) => {
    const { t } = useAppContext();
    
    const topPanelRef = useRef<HTMLDivElement>(null);
    const chartStateRef = useRef<any>(null);
    const plotContainerRef = useRef<HTMLDivElement>(null);
    
    if (!fileState) return null;

    const { 
        isPlotted, 
        analysisResult, 
        data, 
        selectedRowIndices, 
        independentVar, 
        dependentVar,
        uiState
    } = fileState;
    const { 
        plotExplorerWidth,
        topPanelHeight,
        activePlotTool,
        xAxisDomain,
        yAxisDomain,
        selectedPlotIndices,
        activePlotRenderer,
        // FIX: Destructure exportConfig to pass down individual style props.
        exportConfig,
        ...plotStyles
    } = uiState;

    const currentRenderer = forceRenderer || activePlotRenderer;
    
    const updateUiState = (updates: Partial<UIState>) => {
        if (isReadOnly) return;
        updateFileState({ uiState: { ...uiState, ...updates }});
    }

    const handleZoom = (factor: number) => {
        const [xMin, xMax] = xAxisDomain;
        const [yMin, yMax] = yAxisDomain;

        if (typeof xMin !== 'number' || typeof xMax !== 'number' || typeof yMin !== 'number' || typeof yMax !== 'number') return;
        
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        const newXRange = xRange * factor;
        const newYRange = yRange * factor;
        const xCenter = xMin + xRange / 2;
        const yCenter = yMin + yRange / 2;
        updateUiState({ 
            xAxisDomain: [xCenter - newXRange / 2, xCenter + newXRange / 2],
            yAxisDomain: [yCenter - newYRange / 2, yCenter + newYRange / 2]
        });
    };

    const handleResetView = useCallback(() => {
        updateUiState({
            xAxisDomain: getPaddedDomain(data, independentVar),
            yAxisDomain: getPaddedDomain(data, dependentVar),
            activePlotTool: null
        });
    }, [updateFileState, data, independentVar, dependentVar, uiState]);

    const handleClearSelection = useCallback(() => {
        updateUiState({ selectedPlotIndices: new Set() });
    }, [updateFileState, uiState]);

    const handleMouseDownPlotExplorerResizer = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (topPanelRef.current) {
                const parentRect = topPanelRef.current.getBoundingClientRect();
                const newWidth = explorerPosition === 'right' 
                    ? parentRect.right - moveEvent.clientX 
                    : moveEvent.clientX - parentRect.left;

                if (newWidth > 200 && newWidth < parentRect.width - 300) {
                    updateUiState({ plotExplorerWidth: newWidth });
                }
            }
        };
        const handleMouseUp = () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [updateUiState, uiState, explorerPosition]);

    const handleMouseDownHorizontal = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'row-resize';
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const parent = (e.currentTarget as HTMLElement).parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                const newHeight = moveEvent.clientY - parentRect.top;
                const newHeightPercent = (newHeight / parentRect.height) * 100;
                if (newHeightPercent > 20 && newHeightPercent < 80) {
                    updateUiState({ topPanelHeight: newHeightPercent });
                }
            }
        };
        const handleMouseUp = () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [updateUiState, uiState]);

    const { 
        unselectedData, 
        selectedData, 
        inactiveData,
        activePlotData
    } = useMemo(() => {
        const currentActivePlotData: DataPoint[] = [];
        const inactivePlotData: DataPoint[] = [];
        const dataPointToOriginalIndex = new Map<DataPoint, number>();
        data.forEach((d, i) => dataPointToOriginalIndex.set(d, i));
        data.forEach((d, i) => {
            if (selectedRowIndices.has(i)) currentActivePlotData.push(d);
            else inactivePlotData.push(d);
        });
        const selectedPlotData = currentActivePlotData.filter((d) => {
            const originalIndex = dataPointToOriginalIndex.get(d);
            return originalIndex !== undefined && selectedPlotIndices.has(originalIndex);
        });
        const unselectedPlotData = currentActivePlotData.filter(d => !selectedPlotData.includes(d));
        return { unselectedData: unselectedPlotData, selectedData: selectedPlotData, inactiveData: inactivePlotData, activePlotData: currentActivePlotData };
    }, [data, selectedRowIndices, selectedPlotIndices]);
    
    const validActivePlotData = useMemo(() => {
        if (!independentVar || !dependentVar) return [];
        return activePlotData.filter(d =>
            typeof d[independentVar] === 'number' && isFinite(d[independentVar]) &&
            typeof d[dependentVar] === 'number' && isFinite(d[dependentVar])
        );
    }, [activePlotData, independentVar, dependentVar]);

    const plotExplorerPanel = (
        <div className="flex-shrink-0 h-full bg-sidebar dark:bg-dark-sidebar" style={{ width: `${plotExplorerWidth}px` }}>
            <PlotExplorerPanel
                plotContainerRef={plotContainerRef}
                uiState={uiState}
                updateUiState={updateUiState}
            />
        </div>
    );
    
    const resizer = (
        <div
            className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
            onMouseDown={handleMouseDownPlotExplorerResizer}
        >
            <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
        </div>
    );


    return (
        <div className="w-full h-full flex flex-col">
            {isPlotted && analysisResult ? (
                <>
                    <div ref={topPanelRef} className="flex" style={{ height: `${topPanelHeight}%`, minHeight: 0 }}>
                        
                        {explorerPosition === 'left' && plotExplorerPanel}
                        {explorerPosition === 'left' && resizer}

                        <div className="flex-grow flex flex-col" style={{ width: `calc(100% - ${plotExplorerWidth}px - 6px)` }}>
                                <div className="flex-shrink-0 border-b border-border dark:border-dark-border flex items-center justify-between">
                                {currentRenderer === 'recharts' ? (
                                    <PlotToolbar 
                                        activeTool={activePlotTool}
                                        setActiveTool={(tool) => updateUiState({ activePlotTool: tool })}
                                        onZoomIn={() => handleZoom(0.8)}
                                        onZoomOut={() => handleZoom(1.2)}
                                        onReset={handleResetView}
                                        onClearSelection={handleClearSelection}
                                        hasSelection={selectedPlotIndices.size > 0}
                                    />
                                ) : <div />}
                                    <div className="flex items-center text-xs px-2">
                                    <button 
                                        onClick={() => !forceRenderer && updateUiState({ activePlotRenderer: 'recharts' })} 
                                        className={`px-2 py-1 rounded-md ${currentRenderer === 'recharts' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:bg-black/5'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                        disabled={!!forceRenderer}
                                    >{t('main.plot_tab_recharts')}</button>
                                    <button 
                                        onClick={() => !forceRenderer && updateUiState({ activePlotRenderer: 'plotly' })} 
                                        className={`px-2 py-1 rounded-md ${currentRenderer === 'plotly' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:bg-black/5'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                        disabled={!!forceRenderer}
                                    >{t('main.plot_tab_plotly')}</button>
                                </div>
                            </div>
                            <div className="flex-grow p-4 min-h-0">
                                {currentRenderer === 'recharts' ? (
                                    <PlotPanel
                                        data={data}
                                        residualsData={validActivePlotData}
                                        inactiveData={inactiveData}
                                        unselectedData={unselectedData}
                                        selectedData={selectedData}
                                        analysisResult={analysisResult}
                                        independentVar={independentVar}
                                        dependentVar={dependentVar}
                                        
                                        chartStateRef={chartStateRef}
                                        plotContainerRef={plotContainerRef}
                                        activeTool={activePlotTool}
                                        xAxisDomain={xAxisDomain} setXAxisDomain={(d) => updateUiState({ xAxisDomain: d })}
                                        yAxisDomain={yAxisDomain} setYAxisDomain={(d) => updateUiState({ yAxisDomain: d })}
                                        selectedIndices={selectedPlotIndices} setSelectedIndices={(i) => updateUiState({ selectedPlotIndices: i })}
                                        
                                        {...plotStyles}
                                        // FIX: Pass legend, title props from exportConfig
                                        showLegend={exportConfig.showLegend}
                                        showTitle={exportConfig.showTitle}
                                        title={exportConfig.title}
                                    />
                                ) : (
                                    <PlotlyPanel
                                        data={data}
                                        residualsData={validActivePlotData}
                                        activeData={activePlotData}
                                        analysisResult={analysisResult}
                                        independentVar={independentVar}
                                        dependentVar={dependentVar}
                                        
                                        onAnalysisSelectionChange={(newIndices: Set<number>) => updateFileState({ selectedRowIndices: newIndices })}
                                        onResetView={handleResetView}
                                        totalDataPoints={data.length}
                                        selectedRowIndices={selectedRowIndices}
                                        
                                        xAxisDomain={xAxisDomain} setXAxisDomain={(d) => updateUiState({ xAxisDomain: d })}
                                        yAxisDomain={yAxisDomain} setYAxisDomain={(d) => updateUiState({ yAxisDomain: d })}
                                        uiRevision={uiState.uiRevision}
                                        
                                        {...plotStyles}
                                        // FIX: Pass legend, title props from exportConfig
                                        showLegend={exportConfig.showLegend}
                                        showTitle={exportConfig.showTitle}
                                        title={exportConfig.title}
                                    />
                                )}
                            </div>
                        </div>
                        
                        {explorerPosition === 'right' && resizer}
                        {explorerPosition === 'right' && plotExplorerPanel}

                    </div>
                    <div
                        className="h-2 flex-shrink-0 bg-border dark:bg-dark-border cursor-row-resize group flex items-center justify-center hover:bg-accent/20 transition-colors"
                        onMouseDown={handleMouseDownHorizontal}
                    >
                        <div className="w-8 h-1 bg-gray-400 dark:bg-gray-600 rounded-full group-hover:bg-accent"></div>
                    </div>
                    <div className="flex-shrink-0" style={{ height: `calc(100% - ${topPanelHeight}% - 8px)` }}>
                        <AnalysisPanel 
                            result={analysisResult} 
                            independentVar={independentVar}
                            dependentVar={dependentVar}
                            sidebarPosition={analysisSidebarPosition}
                        />
                    </div>
                </>
            ) : (
                <div className="p-6 h-full"><PlotPlaceholder /></div>
            )}
        </div>
    );
};