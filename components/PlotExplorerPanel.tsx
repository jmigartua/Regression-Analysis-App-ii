
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface PlotExplorerPanelProps {
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  showObservations: boolean;
  onToggleObservations: (show: boolean) => void;
  showLine: boolean;
  onToggleLine: (show: boolean) => void;
  showResiduals: boolean;
  onToggleResiduals: (show: boolean) => void;

  scatterColor: string;
  setScatterColor: (color: string) => void;
  scatterOpacity: number;
  setScatterOpacity: (opacity: number) => void;
  scatterSize: number;
  setScatterSize: (size: number) => void;

  lineColor: string;
  setLineColor: (color: string) => void;
  lineOpacity: number;
  setLineOpacity: (opacity: number) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  lineStyle: string;
  setLineStyle: (style: string) => void;

  residualsColor: string;
  setResidualsColor: (color: string) => void;
  residualsOpacity: number;
  setResidualsOpacity: (opacity: number) => void;
  residualsWidth: number;
  setResidualsWidth: (width: number) => void;
  residualsStyle: string;
  setResidualsStyle: (style: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border dark:border-dark-border">
      <button 
        className="flex items-center cursor-pointer px-2 py-2 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
          <ChevronDown className={`w-4 h-4 mr-2 flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}/>
          <h3 className="text-xs font-bold uppercase text-text-primary dark:text-gray-200 tracking-wider select-none">{title}</h3>
      </button>
      {isOpen && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label onClick={(e) => { e.preventDefault(); onChange(!checked); }} className="flex items-center justify-between space-x-2 cursor-pointer select-none">
        <span className="text-sm text-text-secondary dark:text-gray-300">{label}</span>
        <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);

const ControlWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary dark:text-gray-300">{label}</label>
        {children}
    </div>
);

export const PlotExplorerPanel: React.FC<PlotExplorerPanelProps> = (props) => {
  const { t } = useAppContext();

  return (
    <div className="h-full w-full flex flex-col">
        <div className="p-2 border-b border-border dark:border-dark-border flex-shrink-0">
            <span className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 px-2">{t('plot_explorer.title')}</span>
        </div>
        <div className="flex-grow overflow-y-auto">
            <Section title={t('plot_explorer.scatter')} defaultOpen>
                <Toggle label={t('analysis.show_observations')} checked={props.showObservations} onChange={props.onToggleObservations} />
                <ControlWrapper label={t('plot_explorer.color')}>
                    <input type="color" value={props.scatterColor} onChange={(e) => props.setScatterColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-inherit" />
                </ControlWrapper>
                 <ControlWrapper label={t('plot_explorer.opacity')}>
                    <input type="range" min="0" max="1" step="0.1" value={props.scatterOpacity} onChange={e => props.setScatterOpacity(parseFloat(e.target.value))} className="w-24" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.size')}>
                    <input type="range" min="1" max="20" step="1" value={props.scatterSize} onChange={e => props.setScatterSize(parseInt(e.target.value))} className="w-24" />
                </ControlWrapper>
            </Section>
            <Section title={t('plot_explorer.regression_line')}>
                <Toggle label={t('analysis.show_line')} checked={props.showLine} onChange={props.onToggleLine} />
                <ControlWrapper label={t('plot_explorer.color')}>
                    <input type="color" value={props.lineColor} onChange={(e) => props.setLineColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-inherit" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.opacity')}>
                    <input type="range" min="0" max="1" step="0.1" value={props.lineOpacity} onChange={e => props.setLineOpacity(parseFloat(e.target.value))} className="w-24" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.width')}>
                    <input type="range" min="1" max="10" step="0.5" value={props.lineWidth} onChange={e => props.setLineWidth(parseFloat(e.target.value))} className="w-24" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.style')}>
                    <select value={props.lineStyle} onChange={(e) => props.setLineStyle(e.target.value)} className="bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md p-1 text-sm">
                        <option value="solid">{t('plot_explorer.style_solid')}</option>
                        <option value="dashed">{t('plot_explorer.style_dashed')}</option>
                        <option value="dotted">{t('plot_explorer.style_dotted')}</option>
                    </select>
                </ControlWrapper>
            </Section>
            <Section title={t('plot_explorer.residuals')}>
                <Toggle label={t('analysis.show_residuals')} checked={props.showResiduals} onChange={props.onToggleResiduals} />
                 <ControlWrapper label={t('plot_explorer.color')}>
                    <input type="color" value={props.residualsColor} onChange={(e) => props.setResidualsColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-inherit" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.opacity')}>
                    <input type="range" min="0" max="1" step="0.1" value={props.residualsOpacity} onChange={e => props.setResidualsOpacity(parseFloat(e.target.value))} className="w-24" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.width')}>
                    <input type="range" min="1" max="10" step="0.5" value={props.residualsWidth} onChange={e => props.setResidualsWidth(parseFloat(e.target.value))} className="w-24" />
                </ControlWrapper>
                <ControlWrapper label={t('plot_explorer.style')}>
                    <select value={props.residualsStyle} onChange={(e) => props.setResidualsStyle(e.target.value)} className="bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md p-1 text-sm">
                        <option value="solid">{t('plot_explorer.style_solid')}</option>
                        <option value="dashed">{t('plot_explorer.style_dashed')}</option>
                        <option value="dotted">{t('plot_explorer.style_dotted')}</option>
                    </select>
                </ControlWrapper>
            </Section>
            <Section title={t('plot_explorer.general')}>
                <Toggle label={t('analysis.show_grid')} checked={props.showGrid} onChange={props.onToggleGrid} />
            </Section>
        </div>
    </div>
  );
};
