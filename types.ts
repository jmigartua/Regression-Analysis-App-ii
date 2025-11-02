
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

export interface UIState {
  tablePanelWidth: number;
  plotExplorerWidth: number;
  topPanelHeight: number;
  
  // Plot interaction state
  selectedPlotIndices: Set<number>;
  activePlotTool: 'pan' | 'select' | null;
  xAxisDomain: [any, any];
  yAxisDomain: [any, any];
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
}
