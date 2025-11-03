

import React from 'react';
import { DataTable } from './DataTable';
import { PlottingWorkspace } from './PlottingWorkspace';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';


export const MainPanel: React.FC = () => {
    const { fileState, updateFileState } = useFileContext();
    const mainPanelRef = React.useRef<HTMLDivElement>(null);
    
    if (!fileState) return null;

    const { uiState } = fileState;
    const { tablePanelWidth } = uiState;
    
    const updateUiState = (updates: Partial<typeof uiState>) => {
        updateFileState({ uiState: { ...uiState, ...updates }});
    }

    const handleMouseDownTableResizer = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (mainPanelRef.current) {
                const parentRect = mainPanelRef.current.getBoundingClientRect();
                const newWidth = moveEvent.clientX - parentRect.left;
                if (newWidth > 300 && newWidth < parentRect.width - 300) {
                    updateUiState({ tablePanelWidth: newWidth });
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
    }, [updateFileState, uiState]);

    return (
        <div ref={mainPanelRef} className="flex-grow flex bg-panel dark:bg-dark-panel overflow-hidden">
            <div className="flex-shrink-0 h-full" style={{ width: `${tablePanelWidth}px` }}>
                <DataTable />
            </div>
            <div
                className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
                onMouseDown={handleMouseDownTableResizer}
            >
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
            </div>
            <div className="flex-grow flex flex-col" style={{ width: `calc(100% - ${tablePanelWidth}px - 6px)` }}>
               <PlottingWorkspace 
                  fileState={fileState}
                  updateFileState={(updates) => updateFileState(updates)}
                  explorerPosition="right"
               />
            </div>
        </div>
    );
};