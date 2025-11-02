import React, { useState, useEffect, useRef } from 'react';
import type { DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';
import { DataTableToolbar } from './DataTableToolbar';

interface DataTableProps {
  // All props are now managed by FileContext
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


export const DataTable: React.FC<DataTableProps> = () => {
  const { t } = useAppContext();
  const { fileState, tableData, updateFileState, handleCellChange } = useFileContext();

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

  if (!fileState || tableData.length === 0) {
    return (
      <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-1 border-b border-border dark:border-dark-border">
             <DataTableToolbar />
          </div>
          <p className="text-text-secondary dark:text-slate-400 p-4">{t('main.no_data')}</p>
      </div>
    );
  }
  
  const { selectedRowIndices, uiState } = fileState;
  const { selectedPlotIndices } = uiState;
  const columns = Object.keys(tableData[0]);
  const allRowsSelected = selectedRowIndices.size === tableData.length && tableData.length > 0;

  const onColumnRename = (oldName: string, newName: string) => {
    // This logic should be in App.tsx and passed via context if it gets complex
    if (oldName === newName || fileState.columns.includes(newName)) return;
    const newColumns = fileState.columns.map(c => c === oldName ? newName : c);
    const newData = fileState.data.map(row => {
        const newRow = { ...row };
        if (Object.prototype.hasOwnProperty.call(newRow, oldName)) {
            newRow[newName] = newRow[oldName];
            delete newRow[oldName];
        }
        return newRow;
    });
    const newIndVar = fileState.independentVar === oldName ? newName : fileState.independentVar;
    const newDepVar = fileState.dependentVar === oldName ? newName : fileState.dependentVar;
    updateFileState({ columns: newColumns, data: newData, independentVar: newIndVar, dependentVar: newDepVar });
  };

  const handleCommit = (row: number, col: string, value: string) => {
    if (row === -1) { // Header
        onColumnRename(col, value.trim());
    } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            handleCellChange(row, col, numValue);
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
    // TODO: move these handlers to App.tsx/context
    const onDeleteColumn = (col: string) => {};
    const onDeleteRow = (rowIndex: number) => {};

    if (contextMenu.type === 'col') {
      const colName = contextMenu.target as string;
      const isCalculated = colName === 'residual' || colName === 'predicted';
      if (isCalculated) return [];
      
      return [{
        label: t('table.delete_column'),
        action: () => { onDeleteColumn(colName); closeMenu(); },
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

  const onSelectAllRows = (selectAll: boolean) => {
      if (selectAll) {
          updateFileState({ selectedRowIndices: new Set(tableData.map((_, i) => i)) });
      } else {
          updateFileState({ selectedRowIndices: new Set() });
      }
  };

  const onRowSelectionChange = (rowIndex: number, isSelected: boolean) => {
    const newIndices = new Set(selectedRowIndices);
    if (isSelected) newIndices.add(rowIndex);
    else newIndices.delete(rowIndex);
    updateFileState({ selectedRowIndices: newIndices });
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-1 border-b border-border dark:border-dark-border">
            <DataTableToolbar />
        </div>
      <div className="overflow-auto h-full relative">
        <table className="w-full text-sm text-left text-text-primary dark:text-slate-300">
          <thead className="text-xs text-text-secondary dark:text-slate-400 uppercase bg-sidebar dark:bg-slate-700/50 sticky top-0">
            <tr>
              <th scope="col" className="px-2 py-3 font-medium text-center w-12">
                <input 
                    type="checkbox" 
                    checked={allRowsSelected}
                    onChange={(e) => onSelectAllRows(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-accent bg-bg-default dark:bg-slate-600 border-border dark:border-slate-500 rounded focus:ring-accent"
                />
              </th>
              <th scope="col" className="px-2 py-3 font-medium text-center w-12">#</th>
              {columns.map((col) => {
                const isCalculated = col === 'residual' || col === 'predicted';
                return (
                    <th key={col} scope="col" className="px-6 py-3 font-medium" onContextMenu={(e) => handleContextMenu(e, 'col', col)}>
                        {editingCell?.row === -1 && editingCell?.col === col && !isCalculated ? (
                            <input
                                ref={inputRef}
                                defaultValue={col}
                                onBlur={(e) => handleCommit(-1, col, e.currentTarget.value)}
                                onKeyDown={(e) => handleKeyDown(e, -1, col)}
                                className="bg-inherit text-inherit w-full outline-none border-b border-accent"
                            />
                        ) : (
                        <span 
                            onDoubleClick={() => { if (!isCalculated) setEditingCell({ row: -1, col })}}
                            className={`${isCalculated ? 'italic cursor-default' : 'cursor-pointer'}`}
                        >
                            {col}
                        </span>
                        )}
                    </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`border-b border-border dark:border-slate-700 transition-colors ${selectedPlotIndices.has(rowIndex) ? 'bg-accent/20' : 'bg-bg-default dark:bg-slate-800 hover:bg-black/5 dark:hover:bg-slate-700/50'}`} 
                onContextMenu={(e) => handleContextMenu(e, 'row', rowIndex)}
              >
                <td className="px-2 py-2 text-center">
                    <input 
                        type="checkbox"
                        checked={selectedRowIndices.has(rowIndex)}
                        onChange={(e) => onRowSelectionChange(rowIndex, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-accent bg-bg-default dark:bg-slate-600 border-border dark:border-slate-500 rounded focus:ring-accent"
                    />
                </td>
                <td className="px-2 py-2 text-center text-text-tertiary dark:text-slate-400">{rowIndex + 1}</td>
                {columns.map((col) => {
                    const isCalculated = col === 'residual' || col === 'predicted';
                    return (
                        <td 
                            key={`${rowIndex}-${col}`} 
                            className={`px-6 py-2 ${isCalculated ? 'text-text-tertiary dark:text-slate-400 italic' : ''}`}
                            onDoubleClick={() => { if (!isCalculated) setEditingCell({ row: rowIndex, col })}}
                        >
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
                                typeof row[col] === 'number' ? (row[col] as number).toPrecision(4) : String(row[col] ?? 'N/A')
                            )}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={getContextMenuOptions()} />}
      </div>
    </div>
  );
};