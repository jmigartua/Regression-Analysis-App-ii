
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

interface VariableSelectorProps {
  columns: string[];
  independentVar: string;
  setIndependentVar: (value: string) => void;
  dependentVar: string;
  setDependentVar: (value: string) => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({ columns, independentVar, setIndependentVar, dependentVar, setDependentVar }) => {
  const { t } = useAppContext();
  return (
    <div className="space-y-4 mt-4">
      <div>
        <label htmlFor="independentVar" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
          {t('variables.independent')}
        </label>
        <select
          id="independentVar"
          value={independentVar}
          onChange={(e) => setIndependentVar(e.target.value)}
          className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dependentVar" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">
          {t('variables.dependent')}
        </label>
        <select
          id="dependentVar"
          value={dependentVar}
          onChange={(e) => setDependentVar(e.target.value)}
          className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
