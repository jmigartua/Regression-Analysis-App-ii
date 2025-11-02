
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { LayoutGrid, BarChart2 } from 'lucide-react';
import { PlotPanel } from './PlotPanel';
import { DataTable } from './DataTable';
import { AnalysisPanel } from './AnalysisPanel';
import type { AnalysisResult, DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface MainPanelProps {
    isPlotted: boolean;
    analysisResult: AnalysisResult | null;
    data: DataPoint[];
    independentVar: string;
    dependentVar: string;
    onCellChange: (rowIndex: number, column: string, value: any) => void;
    onColumnRename: (oldName: string, newName:string) => void;
    onAddColumn: () => void;
    onDeleteColumn: (columnName: string) => void;
    onAddRow: () => void;
    onDeleteRow: (rowIndex: number) => void;
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
    independentVar, 
    dependentVar,
    onCellChange,
    onColumnRename,
    onAddColumn,
    onDeleteColumn,
    onAddRow,
    onDeleteRow 
}) => {
    const mainPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(400);
    const [topPanelHeight, setTopPanelHeight] = useState(60);
    const [showGrid, setShowGrid] = useState(true);
    const [showLine, setShowLine] = useState(true);

    const isResizing = useRef(false);
    const isResizingHorizontal = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseDownHorizontal = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingHorizontal.current = true;
        document.body.style.cursor = 'row-resize';
    };

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        isResizingHorizontal.current = false;
        document.body.style.cursor = 'default';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current && mainPanelRef.current) {
            const parentRect = mainPanelRef.current.getBoundingClientRect();
            const newWidth = e.clientX - parentRect.left;
            if (newWidth > 300 && newWidth < parentRect.width - 400) {
                setLeftPanelWidth(newWidth);
            }
        }
        if (isResizingHorizontal.current && rightPanelRef.current) {
            const parentRect = rightPanelRef.current.getBoundingClientRect();
            const newHeight = e.clientY - parentRect.top;
            const newHeightPercent = (newHeight / parentRect.height) * 100;
            
            if (newHeightPercent > 20 && newHeightPercent < 80) {
                setTopPanelHeight(newHeightPercent);
            }
        }
    }, []);

    useEffect(() => {
        if (isResizing.current || isResizingHorizontal.current) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, [handleMouseMove, handleMouseUp, isResizing.current, isResizingHorizontal.current]);

    if (data.length === 0) {
        return <div className="flex-grow overflow-y-auto p-6"><WorkspacePlaceholder /></div>;
    }

    return (
        <div ref={mainPanelRef} className="flex-grow flex bg-panel dark:bg-dark-panel overflow-hidden">
            <div className="flex-shrink-0 h-full" style={{ width: `${leftPanelWidth}px` }}>
                <DataTable 
                    data={data}
                    onCellChange={onCellChange}
                    onColumnRename={onColumnRename}
                    onAddColumn={onAddColumn}
                    onDeleteColumn={onDeleteColumn}
                    onAddRow={onAddRow}
                    onDeleteRow={onDeleteRow}
                />
            </div>
            <div
                className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
                onMouseDown={handleMouseDown}
            >
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
            </div>
            <div ref={rightPanelRef} className="flex-grow flex flex-col" style={{ width: `calc(100% - ${leftPanelWidth}px - 6px)` }}>
                {isPlotted && analysisResult ? (
                    <>
                        <div className="p-4" style={{ height: `${topPanelHeight}%` }}>
                            <PlotPanel
                                data={data}
                                regressionLine={analysisResult?.regressionLine}
                                independentVar={independentVar}
                                dependentVar={dependentVar}
                                showGrid={showGrid}
                                showLine={showLine}
                            />
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
                                showGrid={showGrid}
                                showLine={showLine}
                                onToggleGrid={setShowGrid}
                                onToggleLine={setShowLine}
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