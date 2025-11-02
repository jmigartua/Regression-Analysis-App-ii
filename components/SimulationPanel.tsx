import React from 'react';
import { TestTube2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const SimulationPanel: React.FC = () => {
    const { t } = useAppContext();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary dark:text-gray-500 p-6">
            <TestTube2 className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary dark:text-gray-400">{t('simulation.title')}</h3>
            <p className="mt-2 max-w-sm">{t('simulation.description')}</p>
        </div>
    );
};
