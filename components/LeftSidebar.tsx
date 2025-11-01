
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { VariableSelector } from './VariableSelector';
import { useAppContext } from '../contexts/AppContext';

interface LeftSidebarProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
  columns: string[];
  independentVar: string;
  setIndependentVar: (value: string) => void;
  dependentVar: string;
  setDependentVar: (value: string) => void;
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

export const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
  const { t } = useAppContext();
  return (
    <aside className="h-full w-full bg-sidebar dark:bg-dark-sidebar flex-shrink-0 flex flex-col">
      <div className="p-2 border-b border-border dark:border-dark-border">
        <span className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 px-2">{t('sidebar.explorer')}</span>
      </div>
      <div className="flex-grow overflow-y-auto py-2 space-y-2">
        <Section title={t('sidebar.data_source')}>
          <FileUploader onFileChange={props.onFileChange} file={props.file} />
        </Section>
        {props.columns.length > 0 && (
          <Section title={t('sidebar.variables')}>
            <VariableSelector
              columns={props.columns}
              independentVar={props.independentVar}
              setIndependentVar={props.setIndependentVar}
              dependentVar={props.dependentVar}
              setDependentVar={props.setDependentVar}
            />
          </Section>
        )}
      </div>
    </aside>
  );
};
