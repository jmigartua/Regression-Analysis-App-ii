
import React from 'react';
import type { DataPoint } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface DataTableProps {
  data: (DataPoint & { residual?: number; predicted?: number })[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const { t } = useAppContext();
  if (!data || data.length === 0) {
    return <p className="text-text-secondary dark:text-slate-400">{t('main.no_data')}</p>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-auto h-full relative">
      <table className="w-full text-sm text-left text-text-primary dark:text-slate-300">
        <thead className="text-xs text-text-secondary dark:text-slate-400 uppercase bg-sidebar dark:bg-slate-700/50 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col" className="px-6 py-3">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-bg-default dark:bg-slate-800 border-b border-border dark:border-slate-700 hover:bg-black/5 dark:hover:bg-slate-700/50">
              {columns.map((col) => (
                <td key={`${rowIndex}-${col}`} className="px-6 py-4">
                  {typeof row[col] === 'number' ? (row[col] as number).toFixed(4) : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
