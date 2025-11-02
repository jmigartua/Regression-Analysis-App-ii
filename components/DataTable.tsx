
import React, { useState, useEffect, useRef } from 'react';
import type { DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Plus } from 'lucide-react';

interface DataTableProps {
  data: (DataPoint & { residual?: number; predicted?: number })[];
  selectedIndices: Set<number>;
  onCellChange: (rowIndex: number, column: string, value: any) => void;
  onColumnRename: (oldName: string, newName:string) => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnName: string) => void;
  onAddRow: () => void;
  onDeleteRow: (rowIndex: number) => void;
}

const ContextMenu: React.FC<{
  x: number;
  y: number;
  options: { label: string; action: () => void; isDestructive?: boolean }[];
}> = ({ x, y, options }) => {
  return (
    <div
      style={{ top: y, left: x }}
      className="absolute bg-sidebar dark:bg-dark-sidebar border border-border dark:border-dark-border rounded-md shadow-lg z-50 py-1"
    >
      <ul>
        {options.map((option, index) => (
          <li key={index}>
            <button
              onClick={option.action}
              className={`w-full text-left px-4 py-1.5 text-sm ${option.isDestructive ? 'text-red-600 dark:text-red-400' : 'text-text-primary dark:text-gray-300'} hover:bg-black/5 dark:hover:bg-white/10`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};


export const DataTable: React.FC<DataTableProps> = ({ data, selectedIndices, onCellChange, onColumnRename, onAddColumn, onDeleteColumn, onAddRow, onDeleteRow }) => {
  const { t } = useAppContext();
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'col' | 'row'; target: string | number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.select();
    }
  }, [editingCell]);
  
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-2 border-b border-border dark:border-dark-border flex items-center space-x-2">
            <button onClick={onAddRow} className="flex items-center text-sm px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50" disabled>
                <Plus className="w-4 h-4 mr-1" /> {t('table.add_row')}
            </button>
            <button onClick={onAddColumn} className="flex items-center text-sm px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50" disabled>
                <Plus className="w-4 h-4 mr-1" /> {t('table.add_column')}
            </button>
          </div>
          <p className="text-text-secondary dark:text-slate-400 p-4">{t('main.no_data')}</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  const handleCommit = (row: number, col: string, value: string) => {
    if (row === -1) { // Header
        onColumnRename(col, value.trim());
    } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            onCellChange(row, col, numValue);
        }
    }
    setEditingCell(null);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: string) => {
    if (e.key === 'Enter') {
        handleCommit(row, col, e.currentTarget.value);
    } else if (e.key === 'Escape') {
        setEditingCell(null);
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent, type: 'col' | 'row', target: string | number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, target });
  }

  const getContextMenuOptions = () => {
    if (!contextMenu) return [];
    const closeMenu = () => setContextMenu(null);
    if (contextMenu.type === 'col') {
      return [{
        label: t('table.delete_column'),
        action: () => { onDeleteColumn(contextMenu.target as string); closeMenu(); },
        isDestructive: true,
      }];
    }
    if (contextMenu.type === 'row') {
      return [{
        label: t('table.delete_row'),
        action: () => { onDeleteRow(contextMenu.target as number); closeMenu(); },
        isDestructive: true,
      }];
    }
    return [];
  };


  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-2 border-b border-border dark:border-dark-border flex items-center space-x-2">
        <button onClick={onAddRow} className="flex items-center text-sm px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10">
            <Plus className="w-4 h-4 mr-1" /> {t('table.add_row')}
        </button>
        <button onClick={onAddColumn} className="flex items-center text-sm px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10">
            <Plus className="w-4 h-4 mr-1" /> {t('table.add_column')}
        </button>
      </div>
      <div className="overflow-auto h-full relative">
        <table className="w-full text-sm text-left text-text-primary dark:text-slate-300">
          <thead className="text-xs text-text-secondary dark:text-slate-400 uppercase bg-sidebar dark:bg-slate-700/50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col" className="px-6 py-3 font-medium cursor-pointer" onDoubleClick={() => setEditingCell({ row: -1, col })} onContextMenu={(e) => handleContextMenu(e, 'col', col)}>
                  {editingCell?.row === -1 && editingCell?.col === col ? (
                      <input
                          ref={inputRef}
                          defaultValue={col}
                          onBlur={(e) => handleCommit(-1, col, e.currentTarget.value)}
                          onKeyDown={(e) => handleKeyDown(e, -1, col)}
                          className="bg-inherit text-inherit w-full outline-none border-b border-accent"
                      />
                  ) : (
                    <span>{col}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`border-b border-border dark:border-slate-700 transition-colors ${selectedIndices.has(rowIndex) ? 'bg-accent/20' : 'bg-bg-default dark:bg-slate-800 hover:bg-black/5 dark:hover:bg-slate-700/50'}`} 
                onContextMenu={(e) => handleContextMenu(e, 'row', rowIndex)}
              >
                {columns.map((col) => (
                  <td key={`${rowIndex}-${col}`} className="px-6 py-2" onDoubleClick={() => setEditingCell({ row: rowIndex, col })}>
                    {editingCell?.row === rowIndex && editingCell?.col === col ? (
                         <input
                            ref={inputRef}
                            type="number"
                            step="any"
                            defaultValue={typeof row[col] === 'number' ? row[col] : ''}
                            onBlur={(e) => handleCommit(rowIndex, col, e.currentTarget.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, col)}
                            className="bg-inherit text-inherit w-full outline-none p-2 -m-2 rounded focus:ring-1 focus:ring-accent"
                        />
                    ) : (
                        typeof row[col] === 'number' ? (row[col] as number).toPrecision(4) : row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={getContextMenuOptions()} />}
      </div>
    </div>
  );
};
