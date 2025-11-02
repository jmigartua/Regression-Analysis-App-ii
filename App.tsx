
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AlertTriangle, X, LayoutGrid } from 'lucide-react';
import { calculateLinearRegression } from './utils/regression';
import type { AnalysisResult, DataPoint } from './types';
import { parseCSV, fileToText } from './utils/csvParser';

import { Header } from './components/Header';
import { ActivityBar } from './components/ActivityBar';
import { LeftSidebar } from './components/LeftSidebar';
import { StatusBar } from './components/StatusBar';
import { FileWorkspace } from './components/FileWorkspace';
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
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'analysis' | 'simulation'>('analysis');

  const [leftPanelWidth, setLeftPanelWidth] = useState(256);
  
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
      setActiveTab('analysis');

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
        setSelectedRowIndices(new Set(parsedData.map((_, i) => i)));
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
        setSelectedRowIndices(new Set<number>());
    }
  }, [t]);
  
  const activeData = useMemo(() => data.filter((_, index) => selectedRowIndices.has(index)), [data, selectedRowIndices]);

  useEffect(() => {
    if (!isPlotted || activeData.length < 2 || !independentVar || !dependentVar) {
      if (isPlotted) { 
        setAnalysisResult(null);
      }
      return;
    }

    if (independentVar === dependentVar) {
      setError(t('error.same_variables'));
      setAnalysisResult(null);
      return;
    }
    
    try {
      const result = calculateLinearRegression(activeData, independentVar, dependentVar);
      setAnalysisResult(result);
      setError(''); // Clear previous errors
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
    }
  }, [activeData, independentVar, dependentVar, isPlotted, t]);


  const handlePlot = useCallback(() => {
    if (!data.length || !independentVar || !dependentVar) {
      setError(t('error.missing_data'));
      return;
    }
    if (independentVar === dependentVar) {
      setError(t('error.same_variables'));
      return;
    }
    
    setError('');
    setIsPlotted(true);
    // The useEffect will now run the analysis
  }, [data.length, independentVar, dependentVar]);
  
  const handleCellChange = useCallback((rowIndex: number, column: string, value: any) => {
    setData(currentData => {
      const newData = [...currentData];
      const newRow = { ...newData[rowIndex], [column]: value };
      newData[rowIndex] = newRow;
      return newData;
    });
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

  }, [columns, independentVar, dependentVar, t]);

  const handleAddColumn = useCallback(() => {
    const newColumnName = prompt(t('table.new_column_prompt'));
    if (newColumnName && !columns.includes(newColumnName)) {
      setColumns(currentCols => [...currentCols, newColumnName]);
      setData(currentData => currentData.map(row => ({ ...row, [newColumnName]: 0 })));
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
  }, [independentVar, dependentVar]);

  const handleAddRow = useCallback(() => {
    setData(currentData => {
      const newData = [...currentData];
      const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: 0 }), {});
      newData.push(newRow);
      
      setSelectedRowIndices(currentIndices => {
        const newIndices = new Set(currentIndices);
        newIndices.add(newData.length - 1); // Select the new row
        return newIndices;
      });

      return newData;
    });
  }, [columns]);
  
  const handleDeleteRow = useCallback((rowIndex: number) => {
    setData(currentData => currentData.filter((_, i) => i !== rowIndex));
    setSelectedRowIndices(currentIndices => {
        const newIndices = new Set<number>();
        currentIndices.forEach(i => {
            if (i < rowIndex) newIndices.add(i);
            else if (i > rowIndex) newIndices.add(i - 1);
        });
        return newIndices;
    });
  }, []);

    const handleDeleteSelectedRows = useCallback(() => {
        if (selectedRowIndices.size === 0) return;

        // Fix: Explicitly type `a` and `b` as numbers to resolve TS inference issue.
        const indicesToDelete = Array.from(selectedRowIndices).sort((a: number, b: number) => b - a);
        
        setData(currentData => {
            const newData = [...currentData];
            for (const index of indicesToDelete) {
                newData.splice(index, 1);
            }
            return newData;
        });
        
        setSelectedRowIndices(new Set<number>());
    }, [selectedRowIndices]);

  const handleRowSelectionChange = useCallback((rowIndex: number, isSelected: boolean) => {
    setSelectedRowIndices(currentIndices => {
        const newIndices = new Set(currentIndices);
        if (isSelected) {
            newIndices.add(rowIndex);
        } else {
            newIndices.delete(rowIndex);
        }
        return newIndices;
    });
  }, []);

  const handleSelectAllRows = useCallback((selectAll: boolean) => {
      if (selectAll) {
          setSelectedRowIndices(new Set(data.map((_, i) => i)));
      } else {
          setSelectedRowIndices(new Set<number>());
      }
  }, [data]);

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

  const WorkspacePlaceholder: React.FC = () => {
    const { t } = useAppContext();
    return (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500">
        <LayoutGrid className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('main.workspace_title')}</h3>
        <p className="mt-2 max-w-sm">{t('main.workspace_description')}</p>
    </div>
  )};


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
            onMouseDown={handleMouseDownLeft}
        >
            <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent transition-colors"></div>
        </div>
        <main className="flex-grow flex flex-col overflow-hidden">
          {file ? (
             <FileWorkspace
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isPlotted={isPlotted}
                analysisResult={analysisResult}
                data={data}
                selectedRowIndices={selectedRowIndices}
                independentVar={independentVar}
                dependentVar={dependentVar}
                onCellChange={handleCellChange}
                onColumnRename={handleColumnRename}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                onDeleteSelectedRows={handleDeleteSelectedRows}
                onRowSelectionChange={handleRowSelectionChange}
                onSelectAllRows={handleSelectAllRows}
             />
          ) : (
            <div className="flex-grow overflow-y-auto p-6"><WorkspacePlaceholder /></div>
          )}
          <StatusBar rowCount={data.length} status={error ? 'Error' : 'Ready'}/>
        </main>
      </div>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
    </div>
  );
}
