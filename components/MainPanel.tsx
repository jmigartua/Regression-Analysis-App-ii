
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { LayoutGrid, Loader2, Pointer } from 'lucide-react';
import { PlotPanel } from './PlotPanel';
import { DataTable } from './DataTable';
import type { AnalysisResult, DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface MainPanelProps {
    isLoading: boolean;
    analysisResult: AnalysisResult | null;
    data: DataPoint[];
    combinedData: any[];
    independentVar: string;
    dependentVar: string;
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

const SelectVariablesPlaceholder: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <Pointer className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.select_vars_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.select_vars_description')}</p>
    </div>
)};

const LoadingSpinner: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary dark:text-gray-400">
        <Loader2 className="w-16 h-16 text-accent animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-text-primary dark:text-gray-300">{t('main.loading_title')}</h3>
        <p className="mt-2">{t('main.loading_description')}</p>
    </div>
)};

export const MainPanel: React.FC<MainPanelProps> = ({ isLoading, analysisResult, data, combinedData, independentVar, dependentVar }) => {
    const mainPanelRef = useRef<HTMLDivElement>(null);
    const [tablePanelWidth, setTablePanelWidth] = useState(400);
    const isResizing = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current && mainPanelRef.current) {
            const parentRect = mainPanelRef.current.getBoundingClientRect();
            const newWidth = parentRect.right - e.clientX;
            if (newWidth > 200 && newWidth < parentRect.width - 300) {
                setTablePanelWidth(newWidth);
            }
        }
    }, []);

    useEffect(() => {
        if (isResizing.current) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, [handleMouseMove, handleMouseUp, isResizing.current]);

    if (isLoading) {
        return <div className="flex-grow overflow-y-auto p-6 bg-panel/80 dark:bg-dark-panel/80"><LoadingSpinner /></div>;
    }

    if (data.length === 0) {
        return <div className="flex-grow overflow-y-auto p-6"><WorkspacePlaceholder /></div>;
    }

    return (
        <div ref={mainPanelRef} className="flex-grow flex bg-panel dark:bg-dark-panel overflow-hidden">
            <div className="flex-grow flex flex-col p-4" style={{ width: `calc(100% - ${tablePanelWidth}px - 4px)` }}>
                {independentVar && dependentVar ? (
                    <PlotPanel
                        data={data}
                        combinedData={combinedData}
                        regressionLine={analysisResult?.regressionLine}
                        independentVar={independentVar}
                        dependentVar={dependentVar}
                    />
                ) : (
                    <SelectVariablesPlaceholder />
                )}
            </div>
            <div
                className="w-1 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize hover:bg-accent"
                onMouseDown={handleMouseDown}
            />
            <div className="flex-shrink-0 h-full" style={{ width: `${tablePanelWidth}px` }}>
                <DataTable data={analysisResult ? combinedData : data} />
            </div>
        </div>
    );
};
