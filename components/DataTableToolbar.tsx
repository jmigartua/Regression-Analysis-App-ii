
import React from 'react';
import { Plus, Trash2, Pilcrow } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface DataTableToolbarProps {
    onAddRow: () => void;
    onAddColumn: () => void;
    onDeleteSelectedRows: () => void;
    hasSelection: boolean;
}

const ToolButton: React.FC<{
    tooltip: string;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ tooltip, onClick, children, disabled }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={tooltip}
            className="p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
        >
            {children}
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-sidebar text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
            {tooltip}
        </div>
    </div>
);

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({ onAddRow, onAddColumn, onDeleteSelectedRows, hasSelection }) => {
    const { t } = useAppContext();
    return (
        <div className="flex items-center space-x-1 p-1">
            <ToolButton tooltip={t('table.add_row')} onClick={onAddRow}>
                <Plus className="w-5 h-5" />
            </ToolButton>
             <ToolButton tooltip={t('table.add_column')} onClick={onAddColumn}>
                <Pilcrow className="w-5 h-5" />
            </ToolButton>
            <div className="w-px h-6 bg-border dark:bg-dark-border mx-1"></div>
            <ToolButton tooltip={t('table.delete_selected_rows')} onClick={onDeleteSelectedRows} disabled={!hasSelection}>
                <Trash2 className="w-5 h-5" />
            </ToolButton>
        </div>
    );
};
