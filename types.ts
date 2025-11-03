
export interface DataPoint {
  [key: string]: number;
}

export interface AnalysisResult {
  slope: number;
  intercept: number;
  rSquared: number;
  stdErr: number;
  stdErrSlope: number;
  stdErrIntercept: number;
  residuals: number[];
  regressionLine: DataPoint[];
  residualPlotData: DataPoint[];
}

export interface ExportConfig {
  fileName: string;
  format: 'png' | 'svg';
  width: number;
  height: number;
  dpi: number;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  fontFamily: string;
  fontSize: number;
  theme: 'current' | 'grayscale' | 'publication';
  showLegend: boolean;
  showTitle: boolean;
}

export interface UIState {
  tablePanelWidth: number;
  plotExplorerWidth: number;
  topPanelHeight: number;
  
  // Plot interaction state
  selectedPlotIndices: Set<number>;
  activePlotTool: 'pan' | 'select' | null;
  xAxisDomain: [any, any];
  yAxisDomain: [any, any];
  xAxisDecimals: number;
  yAxisDecimals: number;
  xAxisLabel: string;
  yAxisLabel: string;

  // Plot renderer state
  activePlotRenderer: 'recharts' | 'plotly';

  // Plot explorer state
  activePlotExplorerTab: 'series' | 'plot' | 'export' | 'code';
  exportConfig: ExportConfig;
  uiRevision?: number;

  // Plot Style State
  showGrid: boolean;
  showObservations: boolean;
  showLine: boolean;
  showResiduals: boolean;
  scatterColor: string;
  scatterOpacity: number;
  scatterSize: number;
  lineColor: string;
  lineOpacity: number;
  lineWidth: number;
  lineStyle: string; // 'solid', 'dashed', 'dotted'
  residualsColor: string;
  residualsOpacity: number;
  residualsWidth: number;
  residualsStyle: string; // 'solid', 'dashed', 'dotted'
}

export interface FileState {
    id: string;
    file: File;
    data: DataPoint[];
    columns: string[];
    independentVar: string;
    dependentVar: string;
    analysisResult: AnalysisResult | null;
    isPlotted: boolean;
    selectedRowIndices: Set<number>;
    activeWorkspaceTab: 'analysis' | 'simulation';
    uiState: UIState;
    simulationState: FileState | null;
}