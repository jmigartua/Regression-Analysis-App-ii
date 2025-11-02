
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { calculateLinearRegression } from './utils/regression';
import type { AnalysisResult, DataPoint } from './types';
import { parseCSV, fileToText } from './utils/csvParser';

import { Header } from './components/Header';
import { ActivityBar } from './components/ActivityBar';
import { LeftSidebar } from './components/LeftSidebar';
import { MainPanel } from './components/MainPanel';
import { StatusBar } from './components/StatusBar';
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

export default function App() {
  const { t } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [independentVar, setIndependentVar] = useState<string>('');
  const [dependentVar, setDependentVar] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isPlotted, setIsPlotted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [leftPanelWidth, setLeftPanelWidth] = useState(256);
  
  const isResizingLeft = useRef(false);

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError(t('error.invalid_file_type'));
        return;
      }
      setFile(selectedFile);
      setError('');
      setAnalysisResult(null);
      setIsPlotted(false);
      setData([]);
      setColumns([]);
      setIndependentVar('');
      setDependentVar('');

      try {
        const textContent = await fileToText(selectedFile);
        const { data: parsedData, columns: parsedColumns } = parseCSV(textContent);
        
        if(parsedData.length === 0 || parsedColumns.length < 2) {
            setError(t('error.empty_csv'));
            return;
        }

        setData(parsedData);
        setColumns(parsedColumns);
        setIndependentVar(parsedColumns[0]);
        setDependentVar(parsedColumns[1]);
      } catch (e) {
        setError(t('error.parse_failed'));
        console.error(e);
      }
    } else {
        setFile(null);
        setData([]);
        setColumns([]);
        setAnalysisResult(null);
        setIsPlotted(false);
    }
  }, [t]);

  const handlePlot = useCallback(async () => {
    if (!data.length || !independentVar || !dependentVar) {
      setError(t('error.missing_data'));
      return;
    }
    if (independentVar === dependentVar) {
      setError(t('error.same_variables'));
      return;
    }
    
    setError('');
    
    try {
      const result = calculateLinearRegression(data, independentVar, dependentVar);
      setAnalysisResult(result);
      setIsPlotted(true);
    } catch (e) {
      const errorCode = e instanceof Error ? e.message : 'UNKNOWN';
      let errorMessage = '';

      switch (errorCode) {
        case 'NOT_ENOUGH_DATA':
          errorMessage = t('error.not_enough_data');
          break;
        case 'IDENTICAL_X_VALUES':
          errorMessage = t('error.identical_x');
          break;
        default:
          errorMessage = t('error.analysis_failed', { errorMessage: errorCode });
      }
      
      setError(errorMessage);
      console.error(e);
      setAnalysisResult(null);
      setIsPlotted(false);
    }
  }, [data, independentVar, dependentVar, t]);
  
  const handleCellChange = useCallback((rowIndex: number, column: string, value: any) => {
    setData(currentData => {
      const newData = [...currentData];
      const newRow = { ...newData[rowIndex], [column]: value };
      newData[rowIndex] = newRow;
      return newData;
    });
    setIsPlotted(false);
    setAnalysisResult(null);
  }, []);

  const handleColumnRename = useCallback((oldName: string, newName: string) => {
    if (oldName === newName || columns.includes(newName)) {
      if (oldName !== newName) {
        setError(t('table.duplicate_column_error', { columnName: newName }));
      }
      return; 
    }
    
    setColumns(currentCols => currentCols.map(c => c === oldName ? newName : c));
    
    setData(currentData => currentData.map(row => {
        const newRow = { ...row };
        if (Object.prototype.hasOwnProperty.call(newRow, oldName)) {
            newRow[newName] = newRow[oldName];
            delete newRow[oldName];
        }
        return newRow;
    }));

    if (independentVar === oldName) setIndependentVar(newName);
    if (dependentVar === oldName) setDependentVar(newName);
    setIsPlotted(false);
    setAnalysisResult(null);

  }, [columns, independentVar, dependentVar, t]);

  const handleAddColumn = useCallback(() => {
    const newColumnName = prompt(t('table.new_column_prompt'));
    if (newColumnName && !columns.includes(newColumnName)) {
      setColumns(currentCols => [...currentCols, newColumnName]);
      setData(currentData => currentData.map(row => ({ ...row, [newColumnName]: 0 })));
      setIsPlotted(false);
      setAnalysisResult(null);
    } else if (newColumnName) {
      setError(t('table.duplicate_column_error', { columnName: newColumnName }));
    }
  }, [columns, t]);

  const handleDeleteColumn = useCallback((columnToDelete: string) => {
    setColumns(currentCols => currentCols.filter(c => c !== columnToDelete));
    setData(currentData => currentData.map(row => {
      const newRow = { ...row };
      delete newRow[columnToDelete];
      return newRow;
    }));
    
    if (independentVar === columnToDelete) setIndependentVar('');
    if (dependentVar === columnToDelete) setDependentVar('');
    setIsPlotted(false);
    setAnalysisResult(null);
  }, [independentVar, dependentVar]);

  const handleAddRow = useCallback(() => {
    setData(currentData => {
      if (currentData.length === 0) {
        const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: 0 }), {});
        return [newRow];
      }
      const newRow = Object.fromEntries(Object.keys(currentData[0]).map(key => [key, 0]));
      return [...currentData, newRow];
    });
    setIsPlotted(false);
    setAnalysisResult(null);
  }, [columns]);
  
  const handleDeleteRow = useCallback((rowIndex: number) => {
    setData(currentData => currentData.filter((_, i) => i !== rowIndex));
    setIsPlotted(false);
    setAnalysisResult(null);
  }, []);


  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingLeft.current) {
        setLeftPanelWidth(e.clientX - 48); // 48 is width of activity bar
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingLeft.current = false;
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    if (isResizingLeft.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [handleMouseMove, handleMouseUp, isResizingLeft.current]);

  return (
    <div className="flex flex-col h-screen bg-bg-default dark:bg-dark-bg font-sans text-text-primary dark:text-gray-300 text-sm antialiased">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <ActivityBar />
        <div style={{ width: `${leftPanelWidth}px` }} className="flex-shrink-0">
          <LeftSidebar 
            onFileChange={handleFileChange} 
            file={file}
            columns={columns}
            independentVar={independentVar}
            setIndependentVar={setIndependentVar}
            dependentVar={dependentVar}
            setDependentVar={setDependentVar}
            onPlot={handlePlot}
          />
        </div>
        <div 
            className="w-1.5 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize group flex items-center justify-center"
            onMouseDown={() => { isResizingLeft.current = true; document.body.style.cursor = 'col-resize'; }}
        >
            <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
        </div>
        <main className="flex-grow flex flex-col overflow-hidden">
          <MainPanel 
            isPlotted={isPlotted}
            analysisResult={analysisResult}
            data={data}
            independentVar={independentVar}
            dependentVar={dependentVar}
            onCellChange={handleCellChange}
            onColumnRename={handleColumnRename}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
          />
          <StatusBar rowCount={data.length} status={error ? 'Error' : 'Ready'}/>
        </main>
      </div>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
    </div>
  );
}