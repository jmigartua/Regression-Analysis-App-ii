
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
      const errorMessage = e instanceof Error ? e.message : t('error.unknown_analysis');
      setError(t('error.analysis_failed', { errorMessage }));
      console.error(e);
      setAnalysisResult(null);
      setIsPlotted(false);
    }
  }, [data, independentVar, dependentVar, t]);

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
            className="w-1 flex-shrink-0 bg-border dark:bg-dark-border cursor-col-resize hover:bg-accent"
            onMouseDown={() => { isResizingLeft.current = true; document.body.style.cursor = 'col-resize'; }}
        />
        <main className="flex-grow flex flex-col overflow-hidden">
          <MainPanel 
            isPlotted={isPlotted}
            analysisResult={analysisResult}
            data={data}
            independentVar={independentVar}
            dependentVar={dependentVar}
          />
          <StatusBar rowCount={data.length} status={error ? 'Error' : 'Ready'}/>
        </main>
      </div>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
    </div>
  );
}
