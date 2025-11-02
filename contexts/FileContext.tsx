
import React, { createContext, useContext } from 'react';
import type { DataPoint, FileState } from '../types';

interface FileContextType {
  fileState: FileState | null;
  tableData: DataPoint[];
  updateFileState: (updates: Partial<FileState>) => void;
  handleCellChange: (rowIndex: number, column: string, value: any) => void;
  handleDeleteSelectedRows: () => void;
  // Add other handlers here as needed
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileContextProvider = FileContext.Provider;

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileContextProvider');
  }
  return context;
};
