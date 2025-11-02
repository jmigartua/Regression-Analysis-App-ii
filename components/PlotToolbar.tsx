
import React from 'react';
import { Move, Home, ZoomIn, ZoomOut, RectangleHorizontal, Trash2 } from 'lucide-react';

export type PlotTool = 'pan' | 'select';

interface PlotToolbarProps {
    activeTool: PlotTool | null;
    setActiveTool: (tool: PlotTool | null) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onClearSelection: () => void;
    hasSelection: boolean;
}

const ToolButton: React.FC<{
    tooltip: string;
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ tooltip, isActive, onClick, children, disabled }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={tooltip}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive 
                    ? 'bg-accent text-white' 
                    : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
        >
            {children}
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-sidebar text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
            {tooltip}
        </div>
    </div>
);

export const PlotToolbar: React.FC<PlotToolbarProps> = ({ activeTool, setActiveTool, onZoomIn, onZoomOut, onReset, onClearSelection, hasSelection }) => {
    
    const handleToolClick = (tool: PlotTool) => {
        setActiveTool(activeTool === tool ? null : tool);
    };

    return (
        <div className="absolute top-2 right-24 bg-sidebar dark:bg-dark-sidebar/80 backdrop-blur-sm p-1 rounded-md shadow-lg border border-border dark:border-dark-border flex items-center space-x-1 z-10">
            <ToolButton tooltip="Pan" isActive={activeTool === 'pan'} onClick={() => handleToolClick('pan')}>
                <Move className="w-5 h-5" />
            </ToolButton>
            <ToolButton tooltip="Box Select" isActive={activeTool === 'select'} onClick={() => handleToolClick('select')}>
                <RectangleHorizontal className="w-5 h-5" />
            </ToolButton>
            
            <div className="w-px h-6 bg-border dark:bg-dark-border mx-1"></div>

            <ToolButton tooltip="Zoom In" onClick={onZoomIn}>
                <ZoomIn className="w-5 h-5" />
            </ToolButton>
            <ToolButton tooltip="Zoom Out" onClick={onZoomOut}>
                <ZoomOut className="w-5 h-5" />
            </ToolButton>

            <div className="w-px h-6 bg-border dark:bg-dark-border mx-1"></div>
            
            <ToolButton tooltip="Reset View" onClick={onReset}>
                <Home className="w-5 h-5" />
            </ToolButton>
            <ToolButton tooltip="Clear Selection" onClick={onClearSelection} disabled={!hasSelection}>
                <Trash2 className="w-5 h-5" />
            </ToolButton>
        </div>
    );
};
