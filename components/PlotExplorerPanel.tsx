
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { useFileContext } from '../contexts/FileContext';
import type { UIState } from '../types';

interface PlotExplorerPanelProps {
  plotContainerRef: React.RefObject<HTMLDivElement>;
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

const LabeledInput: React.FC<{ label: string; children: React.ReactNode; }> = ({label, children}) => (
    <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-gray-400 mb-1">{label}</label>
        {children}
    </div>
);

const triggerDownload = (href: string, filename: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const PlotExplorerPanel: React.FC<PlotExplorerPanelProps> = (props) => {
  const { t, theme } = useAppContext();
  const { fileState, updateFileState } = useFileContext();
  
  if (!fileState) return null;

  const { uiState } = fileState;
  const { activePlotExplorerTab, exportConfig } = uiState;
  const setActiveTab = (tab: 'style' | 'export') => updateFileState({ uiState: { ...uiState, activePlotExplorerTab: tab }});

  const updateExportConfig = (updates: Partial<typeof exportConfig>) => {
    updateFileState({ uiState: { ...uiState, exportConfig: {...exportConfig, ...updates}}});
  }

  const handleExport = async () => {
    const svgElement = props.plotContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const { width, height, dpi, format, fileName, fontFamily, fontSize, title, xAxisLabel, yAxisLabel } = exportConfig;

    // 1. Get all CSS rules from all stylesheets. This is more robust than inlining.
    const cssRules = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join(' ');
            } catch (e) {
                console.warn('Cannot read stylesheet, likely a cross-origin security restriction.', sheet.href);
                return '';
            }
        })
        .join(' ');
    
    // 2. Clone the SVG element
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

    // 3. Set explicit dimensions for export
    svgClone.setAttribute('width', `${width}`);
    svgClone.setAttribute('height', `${height}`);

    // 4. Create a <defs> and <style> element with all the captured CSS
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = `<![CDATA[${cssRules}]]>`;
    defs.appendChild(style);
    svgClone.insertBefore(defs, svgClone.firstChild);

    // 5. Add a background rectangle as the first rendered element
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    const bgColor = theme === 'dark' ? '#282c34' : '#ffffff'; // from tailwind config
    rect.setAttribute('fill', bgColor);
    svgClone.insertBefore(rect, defs.nextSibling);

    // 6. Update fonts, titles, and labels
    const allTextElements = svgClone.querySelectorAll('text');
    allTextElements.forEach(t => {
        t.setAttribute('font-family', fontFamily);
        t.setAttribute('font-size', `${fontSize}px`);
    });

    const findAxisLabel = (axisClass: string) => {
        const labels = svgClone.querySelectorAll(`.${axisClass} .recharts-label text`);
        return labels.length > 0 ? labels[labels.length - 1] : null;
    };
    const xAxisLabelEl = findAxisLabel('recharts-xaxis');
    if (xAxisLabelEl) xAxisLabelEl.textContent = xAxisLabel;

    const yAxisLabelEl = findAxisLabel('recharts-yaxis');
    if (yAxisLabelEl) yAxisLabelEl.textContent = yAxisLabel;
    
    if (title) {
        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleEl.setAttribute('x', `${width / 2}`);
        titleEl.setAttribute('y', '30'); // Add some padding from the top
        titleEl.setAttribute('text-anchor', 'middle');
        titleEl.setAttribute('font-size', `${fontSize * 1.5}px`);
        titleEl.setAttribute('font-family', fontFamily);
        titleEl.setAttribute('font-weight', 'bold');
        titleEl.setAttribute('fill', theme === 'dark' ? '#e5e7eb' : '#1f2937');
        titleEl.textContent = title;
        svgClone.appendChild(titleEl);
    }
    
    // 7. Serialize and trigger download
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    if (format === 'svg') {
      const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(svgBlob);
      triggerDownload(url, `${fileName}.svg`);
      URL.revokeObjectURL(url);
    } else { // PNG
      const image = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const cleanup = () => {
          URL.revokeObjectURL(url);
      };

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = dpi / 96;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            cleanup();
            return;
        }
        
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0, width, height);
        
        const pngUrl = canvas.toDataURL('image/png');
        triggerDownload(pngUrl, `${fileName}.png`);
        cleanup();
      };
      image.onerror = (err) => { 
        console.error("SVG to PNG conversion failed.", err);
        cleanup();
      };
      
      image.src = url;
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
        <div className="p-2 border-b border-border dark:border-dark-border flex-shrink-0">
            <span className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 px-2">{t('plot_explorer.title')}</span>
        </div>
        <div className="flex-shrink-0 border-b border-border dark:border-dark-border px-2">
            <button
                onClick={() => setActiveTab('style')}
                className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activePlotExplorerTab === 'style' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
            >
                {t('plot_explorer.tab_style')}
            </button>
            <button
                onClick={() => setActiveTab('export')}
                className={`px-3 py-2 text-sm font-medium focus:outline-none -mb-px ${activePlotExplorerTab === 'export' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-t-md'}`}
            >
                {t('plot_explorer.tab_export')}
            </button>
        </div>
        <div className="flex-grow overflow-y-auto">
            {activePlotExplorerTab === 'style' && (
              <>
                <Section title={t('plot_explorer.scatter')} defaultOpen>
                    <Toggle label={t('analysis.show_observations')} checked={props.showObservations} onChange={props.onToggleObservations} />
                    <ControlWrapper label={t('plot_explorer.color')}>
                        <input type="color" value={props.scatterColor} onChange={(e) => props.setScatterColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-inherit" />
                    </ControlWrapper>
                    <ControlWrapper label={t('plot_explorer.opacity')}>
                        <input type="range" min="0" max="1" step="0.1" value={props.scatterOpacity} onChange={e => props.setScatterOpacity(parseFloat(e.target.value))} className="w-24" />
                    </ControlWrapper>
                    <ControlWrapper label={t('plot_explorer.size')}>
                        <input type="range" min="1" max="100" step="1" value={props.scatterSize} onChange={e => props.setScatterSize(parseInt(e.target.value))} className="w-24" />
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
              </>
            )}
            {activePlotExplorerTab === 'export' && (
                <div className="p-2 space-y-4">
                  <Section title={t('plot_exporter.title')} defaultOpen>
                    <LabeledInput label={t('plot_exporter.filename')}>
                      <input type="text" value={exportConfig.fileName} onChange={e => updateExportConfig({ fileName: e.target.value })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                    </LabeledInput>
                    <LabeledInput label={t('plot_exporter.format')}>
                      <select value={exportConfig.format} onChange={e => updateExportConfig({ format: e.target.value as 'png' | 'svg' })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md p-1 text-sm">
                          <option value="png">PNG</option>
                          <option value="svg">SVG</option>
                      </select>
                    </LabeledInput>
                  </Section>

                  <Section title={t('plot_exporter.dimensions')} defaultOpen>
                    <div className="grid grid-cols-2 gap-2">
                      <LabeledInput label={t('plot_exporter.width')}>
                        <input type="number" value={exportConfig.width} onChange={e => updateExportConfig({ width: parseInt(e.target.value) })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                      </LabeledInput>
                      <LabeledInput label={t('plot_exporter.height')}>
                        <input type="number" value={exportConfig.height} onChange={e => updateExportConfig({ height: parseInt(e.target.value) })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                      </LabeledInput>
                    </div>
                     {exportConfig.format === 'png' && (
                        <LabeledInput label={t('plot_exporter.dpi')}>
                          <input type="number" step="50" value={exportConfig.dpi} onChange={e => updateExportConfig({ dpi: parseInt(e.target.value) })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                        </LabeledInput>
                     )}
                  </Section>
                  <Section title={t('plot_exporter.labels')}>
                     <LabeledInput label={t('plot_exporter.plot_title')}>
                      <input type="text" value={exportConfig.title} onChange={e => updateExportConfig({ title: e.target.value })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                    </LabeledInput>
                     <LabeledInput label={t('plot_exporter.x_axis_label')}>
                      <input type="text" value={exportConfig.xAxisLabel} onChange={e => updateExportConfig({ xAxisLabel: e.target.value })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                    </LabeledInput>
                     <LabeledInput label={t('plot_exporter.y_axis_label')}>
                      <input type="text" value={exportConfig.yAxisLabel} onChange={e => updateExportConfig({ yAxisLabel: e.target.value })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                    </LabeledInput>
                  </Section>
                   <Section title={t('plot_exporter.typography')}>
                     <LabeledInput label={t('plot_exporter.font_family')}>
                      <select value={exportConfig.fontFamily} onChange={e => updateExportConfig({ fontFamily: e.target.value })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md p-1 text-sm">
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                      </select>
                    </LabeledInput>
                     <LabeledInput label={t('plot_exporter.font_size')}>
                        <input type="number" value={exportConfig.fontSize} onChange={e => updateExportConfig({ fontSize: parseInt(e.target.value) })} className="w-full bg-bg-default dark:bg-slate-700 border border-border dark:border-slate-600 text-text-primary dark:text-white rounded-md p-1 text-sm" />
                      </LabeledInput>
                  </Section>
                  <div className="p-2">
                    <button
                      onClick={handleExport}
                      className="w-full flex items-center justify-center bg-accent hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200"
                    >
                      {t('plot_exporter.export_button')}
                    </button>
                  </div>
                </div>
            )}
        </div>
    </div>
  );
};
