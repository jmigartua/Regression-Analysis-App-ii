import React from 'react';
import { useFileContext } from '../contexts/FileContext';
import { PlottingWorkspace } from './PlottingWorkspace';
import type { FileState } from '../types';

export const SimulationPanel: React.FC = () => {
    const { fileState, updateFileState } = useFileContext();
    const [dividerPosition, setDividerPosition] = React.useState(50); // Initial position at 50%

    if (!fileState || !fileState.simulationState) {
        // You might want a better loading or placeholder state here
        return <div className="p-4">Initializing Simulation...</div>;
    }

    const { simulationState } = fileState;

    // This function will update the nested simulationState
    const updateSimulationState = (updates: Partial<FileState>) => {
        updateFileState({
            simulationState: { ...simulationState, ...updates }
        });
    };
    
    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const parentRect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
            if (parentRect) {
                const newX = moveEvent.clientX - parentRect.left;
                const newPercent = (newX / parentRect.width) * 100;
                // Constrain the divider position
                if (newPercent > 20 && newPercent < 80) {
                    setDividerPosition(newPercent);
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

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Left Panel (Reference) */}
            <div className="h-full" style={{ width: `calc(${dividerPosition}% - 3px)` }}>
                <PlottingWorkspace
                    fileState={fileState}
                    updateFileState={updateFileState}
                    explorerPosition="left"
                    forceRenderer="plotly"
                />
            </div>

            {/* Resizer */}
            <div
                className="w-1.5 h-full flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
                onMouseDown={handleMouseDown}
            >
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
            </div>

            {/* Right Panel (Simulation) */}
            <div className="h-full" style={{ width: `calc(${100 - dividerPosition}% - 3px)` }}>
                <PlottingWorkspace
                    fileState={simulationState}
                    updateFileState={updateSimulationState}
                    explorerPosition="right"
                    analysisSidebarPosition="right"
                    forceRenderer="plotly"
                    showSwapAxesButton={true}
                />
            </div>
        </div>
    );
};