
import React from 'react';
import type { AnalysisResult } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface ResultsPanelProps {
  result: AnalysisResult;
  decimalPoints: number;
}

const StatCard: React.FC<{ title: string; value: number; description: string; uncertainty?: number; decimalPoints: number; }> = ({ title, value, description, uncertainty, decimalPoints }) => (
  <div className="bg-bg-default dark:bg-dark-bg p-3 rounded-md text-center shadow-sm border border-border dark:border-dark-border">
    <h4 className="text-xs font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">{title}</h4>
    <p className="text-xl font-bold text-accent dark:text-accent mt-1">
      {value.toFixed(decimalPoints)}
      {typeof uncertainty === 'number' && (
        <span className="text-base font-normal text-text-tertiary dark:text-gray-400"> ± {uncertainty.toFixed(decimalPoints)}</span>
      )}
    </p>
    <p className="text-xs text-text-tertiary dark:text-gray-500 mt-1">{description}</p>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, decimalPoints }) => {
  const { t } = useAppContext();

  return (
    <div>
      <h3 className="text-xs font-bold uppercase text-text-secondary dark:text-gray-400 tracking-wider mb-3">{t('results.summary')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          title={t('results.rsquared')}
          value={result.rSquared}
          description={t('results.rsquared_desc')}
          decimalPoints={decimalPoints}
        />
        <StatCard 
          title={t('results.stderr')}
          value={result.stdErr}
          description={t('results.stderr_desc')}
          decimalPoints={decimalPoints}
        />
         <StatCard 
          title={t('results.slope')}
          value={result.slope}
          uncertainty={result.stdErrSlope}
          description={t('results.slope_desc')}
          decimalPoints={decimalPoints}
        />
        <StatCard 
          title={t('results.intercept')}
          value={result.intercept}
          uncertainty={result.stdErrIntercept}
          description={t('results.intercept_desc')}
          decimalPoints={decimalPoints}
        />
      </div>
    </div>
  );
};