
import React from 'react';
import type { AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface ResultsPanelProps {
  result: AnalysisResult;
}

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
  <div className="bg-bg-default dark:bg-dark-bg p-3 rounded-md text-center shadow-sm border border-border dark:border-dark-border">
    <h4 className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">{title}</h4>
    <p className="text-xl font-bold text-accent dark:text-accent mt-1">{value}</p>
    <p className="text-xs text-text-tertiary dark:text-gray-500 mt-1">{description}</p>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const { t } = useAppContext();

  return (
    <div>
      <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-3">{t('results.summary')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          title={t('results.rsquared')}
          value={result.rSquared.toFixed(4)} 
          description={t('results.rsquared_desc')}
        />
        <StatCard 
          title={t('results.stderr')}
          value={result.stdErr.toFixed(4)} 
          description={t('results.stderr_desc')}
        />
         <StatCard 
          title={t('results.slope')}
          value={result.slope.toFixed(4)} 
          description={t('results.slope_desc')}
        />
        <StatCard 
          title={t('results.intercept')}
          value={result.intercept.toFixed(4)} 
          description={t('results.intercept_desc')}
        />
      </div>
    </div>
  );
};
