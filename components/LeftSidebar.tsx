
import React, { useState } from 'react';
import { ChevronDown, BarChart2, FileText } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { VariableSelector } from './VariableSelector';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';
import type { FileState } from '../types';
import { getPaddedDomain } from '../utils/regression';

interface LeftSidebarProps {
  onFileAdd: (file: File) => void;
  onAnalysisImport: (file: File) => void;
  files: Record<string, FileState>;
  activeFileId: string | null;
  setActiveFileId: (id: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button 
        className="flex items-center cursor-pointer px-2 py-1 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
          <ChevronDown className={`w-4 h-4 mr-1 flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}/>
          <h3 className="text-xs font-bold uppercase text-text-primary dark:text-gray-200 tracking-wider select-none">{title}</h3>
      </button>
      {isOpen && <div className="pl-4 pr-2 py-1">{children}</div>}
    </div>
  );
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onFileAdd, onAnalysisImport, files, activeFileId, setActiveFileId }) => {
  const { t } = useAppContext();
  const { fileState, updateFileState } = useFileContext();

  const handlePlot = () => {
    if (!fileState) return;
    if (!fileState.data.length || !fileState.independentVar || !fileState.dependentVar) {
      //setError(t('error.missing_data'));
      return;
    }
    if (fileState.independentVar === fileState.dependentVar) {
      //setError(t('error.same_variables'));
      return;
    }
    updateFileState({ isPlotted: true });
  };
  
  const setIndependentVar = (value: string) => {
    if (!fileState) return;
    updateFileState({
      independentVar: value,
      uiState: {
        ...fileState.uiState,
        xAxisDomain: getPaddedDomain(fileState.data, value),
        xAxisLabel: value,
        exportConfig: {
            ...fileState.uiState.exportConfig,
            xAxisLabel: value,
        }
      }
    });
  };
  const setDependentVar = (value: string) => {
    if (!fileState) return;
    updateFileState({
      dependentVar: value,
      uiState: {
        ...fileState.uiState,
        yAxisDomain: getPaddedDomain(fileState.data, value),
        yAxisLabel: value,
        exportConfig: {
            ...fileState.uiState.exportConfig,
            yAxisLabel: value,
        }
      }
    });
  };

  return (
    <aside className="h-full w-full bg-sidebar dark:bg-dark-sidebar flex-shrink-0 flex flex-col">
      <div className="p-2 border-b border-border dark:border-dark-border">
        <span className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 px-2">{t('sidebar.explorer')}</span>
      </div>
      <div className="flex-grow overflow-y-auto py-2 space-y-2">
        <Section title={t('sidebar.data_source')}>
          <FileUploader onFileAdd={onFileAdd} onAnalysisImport={onAnalysisImport} />
           <div className="pt-2">
            {Object.keys(files).length > 0 ? (
                Object.values(files).map((f: FileState) => (
                    <button 
                        key={f.id} 
                        onClick={() => setActiveFileId(f.id)}
                        className={`w-full text-left text-xs p-2 rounded-md flex items-center truncate ${activeFileId === f.id ? 'bg-accent/20 text-accent' : 'text-text-secondary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-accent/10'}`}
                    >
                        <FileText className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        <span className="truncate">{f.file.name}</span>
                    </button>
                ))
            ) : (
              <div className="text-xs text-text-tertiary dark:text-gray-500 px-2 py-1">{t('uploader.no_folder')}</div>
            )}
          </div>
        </Section>
        {fileState && fileState.columns.length > 0 && (
          <Section title={t('sidebar.variables')}>
            <VariableSelector
              columns={fileState.columns}
              independentVar={fileState.independentVar}
              setIndependentVar={setIndependentVar}
              dependentVar={fileState.dependentVar}
              setDependentVar={setDependentVar}
            />
            <div className="mt-4">
              <button
                onClick={handlePlot}
                className="w-full flex items-center justify-center bg-accent hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                {t('sidebar.plot_button')}
              </button>
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
};