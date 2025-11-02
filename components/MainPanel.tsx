import React, { useRef, useState, useCallback, useMemo } from 'react';
import { LayoutGrid, BarChart2 } from 'lucide-react';
import { PlotPanel } from './PlotPanel';
import { DataTable } from './DataTable';
import { AnalysisPanel } from './AnalysisPanel';
import { PlotExplorerPanel } from './PlotExplorerPanel';
import { PlotToolbar, PlotTool } from './PlotToolbar';
import type { AnalysisResult, DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface MainPanelProps {
    isPlotted: boolean;
    analysisResult: AnalysisResult | null;
    data: DataPoint[];
    selectedRowIndices: Set<number>;
    independentVar: string;
    dependentVar: string;
    onCellChange: (rowIndex: number, column: string, value: any) => void;
    onColumnRename: (oldName: string, newName:string) => void;
    onAddColumn: () => void;
    onDeleteColumn: (columnName: string) => void;
    onAddRow: () => void;
    onDeleteRow: (rowIndex: number) => void;
    onDeleteSelectedRows: () => void;
    onRowSelectionChange: (rowIndex: number, isSelected: boolean) => void;
    onSelectAllRows: (selectAll: boolean) => void;
}

const WorkspacePlaceholder: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <LayoutGrid className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.workspace_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.workspace_description')}</p>
    </div>
)};

const PlotPlaceholder: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <BarChart2 className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.plot_placeholder_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.plot_placeholder_description')}</p>
    </div>
)};


export const MainPanel: React.FC<MainPanelProps> = ({ 
    isPlotted, 
    analysisResult, 
    data, 
    selectedRowIndices,
    independentVar, 
    dependentVar,
    onCellChange,
    onColumnRename,
    onAddColumn,
    onDeleteColumn,
    onAddRow,
    onDeleteRow,
    onDeleteSelectedRows,
    onRowSelectionChange,
    onSelectAllRows
}) => {
    const mainPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const topPanelRef = useRef<HTMLDivElement>(null);
    const chartStateRef = useRef<any>(null);

    const [tablePanelWidth, setTablePanelWidth] = useState(400);
    const [plotExplorerWidth, setPlotExplorerWidth] = useState(256);
    const [topPanelHeight, setTopPanelHeight] = useState(60);

    // Interactive Plot State
    const [activeTool, setActiveTool] = useState<PlotTool | null>(null);
    const [xAxisDomain, setXAxisDomain] = useState<[any, any]>(['dataMin', 'dataMax']);
    const [yAxisDomain, setYAxisDomain] = useState<[any, any]>(['dataMin', 'dataMax']);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    
    // Plot style state
    const [showGrid, setShowGrid] = useState(true);
    const [showLine, setShowLine] = useState(true);
    const [showResiduals, setShowResiduals] = useState(true);
    const [showObservations, setShowObservations] = useState(true);
    
    const [scatterColor, setScatterColor] = useState('#4f46e5');
    const [scatterOpacity, setScatterOpacity] = useState(1);
    const [scatterSize, setScatterSize] = useState(30);
    
    const [lineColor, setLineColor] = useState('#10b981');
    const [lineOpacity, setLineOpacity] = useState(1);
    const [lineWidth, setLineWidth] = useState(2);
    const [lineStyle, setLineStyle] = useState('solid');
    
    const [residualsColor, setResidualsColor] = useState('#f97316');
    const [residualsOpacity, setResidualsOpacity] = useState(0.7);
    const [residualsWidth, setResidualsWidth] = useState(1.5);
    const [residualsStyle, setResidualsStyle] = useState('dashed');

    const handleZoom = (factor: number) => {
        if (!chartStateRef.current?.xAxisMap?.scale || !chartStateRef.current?.yAxisMap?.scale) return;

        const { xAxisMap, yAxisMap } = chartStateRef.current;
        const [xMin, xMax] = xAxisMap.scale.domain();
        const [yMin, yMax] = yAxisMap.scale.domain();
        
        if(typeof xMin !== 'number' || typeof xMax !== 'number' || typeof yMin !== 'number' || typeof yMax !== 'number') return;

        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        const newXRange = xRange * factor;
        const newYRange = yRange * factor;
        const xCenter = xMin + xRange / 2;
        const yCenter = yMin + yRange / 2;

        setXAxisDomain([xCenter - newXRange / 2, xCenter + newYRange / 2]);
        setYAxisDomain([yCenter - newYRange / 2, yCenter + newYRange / 2]);
    };

    const handleResetView = useCallback(() => {
        setXAxisDomain(['dataMin', 'dataMax']);
        setYAxisDomain(['dataMin', 'dataMax']);
        setActiveTool(null);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const handleMouseDownTableResizer = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (mainPanelRef.current) {
                const parentRect = mainPanelRef.current.getBoundingClientRect();
                const newWidth = moveEvent.clientX - parentRect.left;
                if (newWidth > 300 && newWidth < parentRect.width - 300) {
                    setTablePanelWidth(newWidth);
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
    }, []);

    const handleMouseDownPlotExplorerResizer = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (topPanelRef.current) {
                const parentRect = topPanelRef.current.getBoundingClientRect();
                const newWidth = parentRect.right - moveEvent.clientX;
                if (newWidth > 200 && newWidth < parentRect.width - 300) {
                    setPlotExplorerWidth(newWidth);
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
    }, []);

    const handleMouseDownHorizontal = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'row-resize';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (rightPanelRef.current) {
                const parentRect = rightPanelRef.current.getBoundingClientRect();
                const newHeight = moveEvent.clientY - parentRect.top;
                const newHeightPercent = (newHeight / parentRect.height) * 100;
                
                if (newHeightPercent > 20 && newHeightPercent < 80) {
                    setTopPanelHeight(newHeightPercent);
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
    }, []);

    const { 
        unselectedData, 
        selectedData, 
        inactiveData,
        residualsData
    } = useMemo(() => {
        const activePlotData: DataPoint[] = [];
        const inactivePlotData: DataPoint[] = [];
        
        // Use a map to easily get the original index of a data point object.
        // This is safer than relying on array indices after filtering.
        const dataPointToOriginalIndex = new Map<DataPoint, number>();
        data.forEach((d, i) => {
            dataPointToOriginalIndex.set(d, i);
        });

        data.forEach((d, i) => {
            if (selectedRowIndices.has(i)) {
                activePlotData.push(d);
            } else {
                inactivePlotData.push(d);
            }
        });

        const selectedPlotData = activePlotData.filter((d) => {
            const originalIndex = dataPointToOriginalIndex.get(d);
            return originalIndex !== undefined && selectedIndices.has(originalIndex);
        });
        
        const unselectedPlotData = activePlotData.filter(d => !selectedPlotData.includes(d));

        return { 
            unselectedData: unselectedPlotData, 
            selectedData: selectedPlotData, 
            inactiveData: inactivePlotData,
            residualsData: activePlotData
        };
    }, [data, selectedRowIndices, selectedIndices]);

    const tableData = useMemo(() => {
        if (!analysisResult || !isPlotted) {
            return data.map(d => ({...d, residual: undefined, predicted: undefined }));
        }

        // A map from original index to its index in the activeData array
        const originalToActiveIndexMap = new Map<number, number>();
        let currentActiveIndex = 0;
        data.forEach((_, index) => {
            if (selectedRowIndices.has(index)) {
                originalToActiveIndexMap.set(index, currentActiveIndex++);
            }
        });
        
        return data.map((row, index) => {
            if (originalToActiveIndexMap.has(index)) {
                const activeIndex = originalToActiveIndexMap.get(index)!;
                const x = row[independentVar];
                if (typeof x === 'number' && analysisResult.residuals.length > activeIndex) {
                    const predicted = analysisResult.intercept + analysisResult.slope * x;
                    const residual = analysisResult.residuals[activeIndex];
                    return { ...row, predicted, residual };
                }
            }
            return { ...row, predicted: undefined, residual: undefined };
        });
    }, [data, analysisResult, selectedRowIndices, independentVar, isPlotted]);


    if (data.length === 0) {
        return <div className="flex-grow overflow-y-auto p-6"><WorkspacePlaceholder /></div>;
    }

    return (
        <div ref={mainPanelRef} className="flex-grow flex bg-panel dark:bg-dark-panel overflow-hidden">
            <div className="flex-shrink-0 h-full" style={{ width: `${tablePanelWidth}px` }}>
                <DataTable 
                    data={tableData}
                    onCellChange={onCellChange}
                    onColumnRename={onColumnRename}
                    onAddColumn={onAddColumn}
                    onDeleteColumn={onDeleteColumn}
                    onAddRow={onAddRow}
                    onDeleteRow={onDeleteRow}
                    onDeleteSelectedRows={onDeleteSelectedRows}
                    selectedIndices={selectedIndices}
                    selectedRowIndices={selectedRowIndices}
                    onRowSelectionChange={onRowSelectionChange}
                    onSelectAllRows={onSelectAllRows}
                />
            </div>
            <div
                className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
                onMouseDown={handleMouseDownTableResizer}
            >
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
            </div>
            <div ref={rightPanelRef} className="flex-grow flex flex-col" style={{ width: `calc(100% - ${tablePanelWidth}px - 6px)` }}>
                {isPlotted && analysisResult ? (
                    <>
                        <div ref={topPanelRef} className="flex" style={{ height: `${topPanelHeight}%` }}>
                            <div className="flex-grow flex flex-col" style={{ width: `calc(100% - ${plotExplorerWidth}px - 6px)` }}>
                                <div className="flex-shrink-0 border-b border-border dark:border-dark-border">
                                    <PlotToolbar 
                                        activeTool={activeTool}
                                        setActiveTool={setActiveTool}
                                        onZoomIn={() => handleZoom(0.8)}
                                        onZoomOut={() => handleZoom(1.2)}
                                        onReset={handleResetView}
                                        onClearSelection={handleClearSelection}
                                        hasSelection={selectedIndices.size > 0}
                                    />
                                </div>
                                <div className="flex-grow p-4">
                                    <PlotPanel
                                        data={data}
                                        residualsData={residualsData}
                                        inactiveData={inactiveData}
                                        unselectedData={unselectedData}
                                        selectedData={selectedData}
                                        analysisResult={analysisResult}
                                        independentVar={independentVar}
                                        dependentVar={dependentVar}
                                        
                                        chartStateRef={chartStateRef}
                                        activeTool={activeTool}
                                        xAxisDomain={xAxisDomain} setXAxisDomain={setXAxisDomain}
                                        yAxisDomain={yAxisDomain} setYAxisDomain={setYAxisDomain}
                                        selectedIndices={selectedIndices} setSelectedIndices={setSelectedIndices}

                                        showGrid={showGrid}
                                        showObservations={showObservations}
                                        showLine={showLine}
                                        showResiduals={showResiduals}
                                        scatterColor={scatterColor}
                                        scatterOpacity={scatterOpacity}
                                        scatterSize={scatterSize}
                                        lineColor={lineColor}
                                        lineOpacity={lineOpacity}
                                        lineWidth={lineWidth}
                                        lineStyle={lineStyle}
                                        residualsColor={residualsColor}
                                        residualsOpacity={residualsOpacity}
                                        residualsWidth={residualsWidth}
                                        residualsStyle={residualsStyle}
                                    />
                                </div>
                            </div>
                            <div
                                className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
                                onMouseDown={handleMouseDownPlotExplorerResizer}
                            >
                                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
                            </div>
                            <div className="flex-shrink-0 h-full bg-sidebar dark:bg-dark-sidebar" style={{ width: `${plotExplorerWidth}px` }}>
                                <PlotExplorerPanel
                                    showGrid={showGrid} onToggleGrid={setShowGrid}
                                    showObservations={showObservations} onToggleObservations={setShowObservations}
                                    showLine={showLine} onToggleLine={setShowLine}
                                    showResiduals={showResiduals} onToggleResiduals={setShowResiduals}
                                    scatterColor={scatterColor} setScatterColor={setScatterColor}
                                    scatterOpacity={scatterOpacity} setScatterOpacity={setScatterOpacity}
                                    scatterSize={scatterSize} setScatterSize={setScatterSize}
                                    lineColor={lineColor} setLineColor={setLineColor}
                                    lineOpacity={lineOpacity} setLineOpacity={setLineOpacity}
                                    lineWidth={lineWidth} setLineWidth={setLineWidth}
                                    lineStyle={lineStyle} setLineStyle={setLineStyle}
                                    residualsColor={residualsColor} setResidualsColor={setResidualsColor}
                                    residualsOpacity={residualsOpacity} setResidualsOpacity={setResidualsOpacity}
                                    residualsWidth={residualsWidth} setResidualsWidth={setResidualsWidth}
                                    residualsStyle={residualsStyle} setResidualsStyle={setResidualsStyle}
                                />
                            </div>
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
                            />
                        </div>
                    </>
                ) : (
                    <div className="p-6 h-full"><PlotPlaceholder /></div>
                )}
            </div>
        </div>
    );
};
