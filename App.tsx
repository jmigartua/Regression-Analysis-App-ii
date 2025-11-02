
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AlertTriangle, X, LayoutGrid } from 'lucide-react';
import { calculateLinearRegression } from './utils/regression';
import type { AnalysisResult, DataPoint, FileState } from './types';
import { parseCSV, fileToText } from './utils/csvParser';
import { FileContextProvider } from './contexts/FileContext';

import { Header } from './components/Header';
import { ActivityBar } from './components/ActivityBar';
import { LeftSidebar } from './components/LeftSidebar';
import { StatusBar } from './components/StatusBar';
import { FileWorkspace } from './components/FileWorkspace';
import { FileTabs } from './components/FileTabs';
import { useAppContext } from './contexts/AppContext';

const ErrorMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-900/80 backdrop-blur-sm border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center shadow-2xl z-50" role="alert">
    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
    <span className="text-sm">{message}</span>
    <button onClick={onClose} className="ml-4 text-red-300 hover:text-white">
      <X className="w-5 h-5" />
    </button>
  </div>
);

const areAnalysisResultsNumericallyEqual = (res1: AnalysisResult | null, res2: AnalysisResult | null): boolean => {
    if (res1 === res2) return true;
    if (!res1 || !res2) return false;

    const tolerance = 1e-9;

    return (
        Math.abs(res1.slope - res2.slope) < tolerance &&
        Math.abs(res1.intercept - res2.intercept) < tolerance &&
        Math.abs(res1.rSquared - res2.rSquared) < tolerance &&
        Math.abs(res1.stdErr - res2.stdErr) < tolerance &&
        Math.abs(res1.stdErrSlope - res2.stdErrSlope) < tolerance &&
        // FIX: Added missing comparison with tolerance to return a boolean.
        Math.abs(res1.stdErrIntercept - res2.stdErrIntercept) < tolerance
    );
};

export default function App() {
  const { t } = useAppContext();
  const [files, setFiles] = useState<Record<string, FileState>>({});
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(256);

  const activeFileState = useMemo(() => {
    if (!activeFileId || !files[activeFileId]) return null;
    return files[activeFileId];
  }, [files, activeFileId]);
  
  const handleAddNewFile = useCallback(async (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv') {
      setError(t('error.invalid_file_type'));
      return;
    }
    
    setError('');
    
    try {
      const textContent = await fileToText(selectedFile);
      const { data: parsedData, columns: parsedColumns } = parseCSV(textContent);
      
      if(parsedColumns.length < 2) {
          setError(t('error.not_enough_columns'));
          return;
      }
      if(parsedData.length === 0) {
          setError(t('error.no_data_rows'));
          return;
      }
      
      const newFileId = Date.now().toString();
      const newFileState: FileState = {
        id: newFileId,
        file: selectedFile,
        data: parsedData,
        columns: parsedColumns,
        independentVar: parsedColumns[0],
        dependentVar: parsedColumns[1],
        analysisResult: null,
        isPlotted: false,
        selectedRowIndices: new Set(parsedData.map((_, i) => i)),
        activeWorkspaceTab: 'analysis',
        uiState: {
          tablePanelWidth: 400,
          plotExplorerWidth: 256,
          topPanelHeight: 60,
          selectedPlotIndices: new Set(),
          activePlotTool: null,
          xAxisDomain: ['dataMin', 'dataMax'],
          yAxisDomain: ['dataMin', 'dataMax'],
        }
      };

      setFiles(prev => ({ ...prev, [newFileId]: newFileState }));
      setActiveFileId(newFileId);

    } catch (e) {
      setError(t('error.parse_failed'));
      console.error(e);
    }
  }, [t]);

  const handleImportAnalysis = useCallback(async (analysisFile: File) => {
    setError('');
    try {
      const jsonContent = await fileToText(analysisFile);
      const parsedState = JSON.parse(jsonContent);

      // Basic validation
      if (!parsedState.fileName || !parsedState.data || !parsedState.columns) {
        throw new Error('Invalid analysis file structure.');
      }

      const newFileId = Date.now().toString();
      const newFileState: FileState = {
        ...parsedState,
        id: newFileId,
        // Reconstruct non-serializable parts
        file: new File([], parsedState.fileName, { type: 'text/plain' }), // Mock file object
        selectedRowIndices: new Set(parsedState.selectedRowIndices),
        uiState: {
          ...parsedState.uiState,
          selectedPlotIndices: new Set(parsedState.uiState.selectedPlotIndices),
        },
      };

      setFiles(prev => ({ ...prev, [newFileId]: newFileState }));
      setActiveFileId(newFileId);

    } catch (e) {
      setError(t('error.import_failed'));
      console.error(e);
    }
  }, [t]);

  const handleSaveAnalysis = useCallback(() => {
    if (!activeFileState) return;

    const { file, selectedRowIndices, uiState, ...rest } = activeFileState;
    
    const savableState = {
      ...rest,
      fileName: file.name,
      selectedRowIndices: Array.from(selectedRowIndices),
      uiState: {
        ...uiState,
        selectedPlotIndices: Array.from(uiState.selectedPlotIndices),
      },
    };

    const jsonString = JSON.stringify(savableState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.lra`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }, [activeFileState]);

  const handleCloseFile = useCallback((fileIdToClose: string) => {
    setFiles(currentFiles => {
      const newFiles = { ...currentFiles };
      delete newFiles[fileIdToClose];
      return newFiles;
    });

    if (activeFileId === fileIdToClose) {
      const remainingFileIds = Object.keys(files).filter(id => id !== fileIdToClose);
      if (remainingFileIds.length > 1) { // Check length > 1 because files object isn't updated yet
        // A simple approach: activate the first remaining file.
        const fileKeys = Object.keys(files);
        const newActiveId = fileKeys.find(id => id !== fileIdToClose);
        setActiveFileId(newActiveId || null);
      } else {
        setActiveFileId(null);
      }
    }
  }, [activeFileId, files]);
  
  const activeData = useMemo(() => {
    if (!activeFileState) return [];
    return activeFileState.data.filter((_, index) => activeFileState.selectedRowIndices.has(index));
  }, [activeFileState]);

  const updateFileState = useCallback((fileId: string | null, updates: Partial<FileState>) => {
    if (!fileId) return;
    setFiles(currentFiles => {
        const fileToUpdate = currentFiles[fileId];
        if (!fileToUpdate) return currentFiles;

        const updatedFile = { ...fileToUpdate, ...updates };
        
        if (updates.uiState) {
            updatedFile.uiState = { ...fileToUpdate.uiState, ...updates.uiState };
        }
        
        return { ...currentFiles, [fileId]: updatedFile };
    });
  }, []);

  // This effect performs the regression analysis on the active file
  useEffect(() => {
    if (!activeFileId || !activeFileState) return;

    if (!activeFileState.isPlotted || activeData.length < 2 || !activeFileState.independentVar || !activeFileState.dependentVar) {
      if (activeFileState.isPlotted && activeFileState.analysisResult !== null) {
         updateFileState(activeFileId, { analysisResult: null });
      }
      return;
    }

    if (activeFileState.independentVar === activeFileState.dependentVar) {
      setError(t('error.same_variables'));
      if (activeFileState.analysisResult !== null) {
        updateFileState(activeFileId, { analysisResult: null });
      }
      return;
    }
    
    try {
      const result = calculateLinearRegression(activeData, activeFileState.independentVar, activeFileState.dependentVar);
      if (!areAnalysisResultsNumericallyEqual(activeFileState.analysisResult, result)) {
        updateFileState(activeFileId, { analysisResult: result });
      }
      setError(''); // Clear previous errors
    } catch (e) {
      const errorCode = e instanceof Error ? e.message : 'UNKNOWN';
      let errorMessage = '';

      switch (errorCode) {
        case 'NOT_ENOUGH_DATA': errorMessage = t('error.not_enough_data'); break;
        case 'IDENTICAL_X_VALUES': errorMessage = t('error.identical_x'); break;
        default: errorMessage = t('error.analysis_failed', { errorMessage: errorCode });
      }
      
      setError(errorMessage);
      console.error(e);
      if (activeFileState.analysisResult !== null) {
        updateFileState(activeFileId, { analysisResult: null });
      }
    }
  }, [activeData, activeFileState, activeFileId, t, updateFileState]);

  const tableData = useMemo(() => {
    if (!activeFileState) return [];
    
    const { data, analysisResult, isPlotted, selectedRowIndices, independentVar, dependentVar } = activeFileState;

    if (!analysisResult || !isPlotted) {
        return data;
    }

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
            if (typeof x === 'number' && typeof row[dependentVar] === 'number' && analysisResult.residuals.length > activeIndex) {
                const predicted = analysisResult.intercept + analysisResult.slope * x;
                const residual = analysisResult.residuals[activeIndex];
                return { ...row, predicted, residual };
            }
        }
        return { ...row, predicted: undefined, residual: undefined };
    });
  }, [activeFileState]);

  const handleCellChange = (rowIndex: number, column: string, value: any) => {
    if (!activeFileState) return;
    const newData = [...activeFileState.data];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    updateFileState(activeFileId, { data: newData });
  };

  const handleDeleteSelectedRows = () => {
    if (!activeFileState || activeFileState.selectedRowIndices.size === 0) return;
    const indicesToDelete = Array.from(activeFileState.selectedRowIndices).sort((a: number, b: number) => b - a);
    const newData = activeFileState.data.filter((_, index) => !activeFileState.selectedRowIndices.has(index));
    updateFileState(activeFileId, { data: newData, selectedRowIndices: new Set() });
  };
  
  // Create other handlers that use `updateFileState`...
  // These will be passed in the context
   const contextValue = useMemo(() => ({
    fileState: activeFileState,
    tableData: tableData,
    updateFileState: (updates: Partial<FileState>) => updateFileState(activeFileId, updates),
    handleCellChange: handleCellChange,
    handleDeleteSelectedRows: handleDeleteSelectedRows,
    // Add other handlers here as they are refactored
  }), [activeFileState, activeFileId, tableData, updateFileState]);


  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = moveEvent.clientX - 48; // 48 is width of activity bar
      const constrainedWidth = Math.max(200, Math.min(newWidth, 500));
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const WorkspacePlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <LayoutGrid className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.workspace_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.workspace_description')}</p>
    </div>
  );


  return (
    <div className="flex flex-col h-screen bg-bg-default dark:bg-dark-bg font-sans text-text-primary dark:text-gray-300 text-sm antialiased">
      <Header />
      <FileContextProvider value={contextValue}>
        <div className="flex flex-grow overflow-hidden">
          <ActivityBar onSave={handleSaveAnalysis} hasActiveFile={!!activeFileId} />
          <div style={{ width: `${leftPanelWidth}px` }} className="flex-shrink-0">
            <LeftSidebar 
              onFileAdd={handleAddNewFile} 
              onAnalysisImport={handleImportAnalysis}
              files={files}
              activeFileId={activeFileId}
              setActiveFileId={setActiveFileId}
            />
          </div>
          <div 
              className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
              onMouseDown={handleMouseDownLeft}
          >
              <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
          </div>
          <main className="flex-grow flex flex-col overflow-hidden">
            {activeFileId && activeFileState ? (
              <div className="flex flex-col flex-grow overflow-hidden">
                <FileTabs
                  files={files}
                  activeFileId={activeFileId}
                  onSelectTab={setActiveFileId}
                  onCloseTab={handleCloseFile}
                />
                <FileWorkspace key={activeFileId} />
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-6"><WorkspacePlaceholder /></div>
            )}
            <StatusBar rowCount={activeFileState?.data.length ?? 0} status={error ? 'Error' : 'Ready'}/>
          </main>
        </div>
      </FileContextProvider>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
    </div>
  );
}
