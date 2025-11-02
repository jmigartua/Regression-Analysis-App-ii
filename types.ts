
export interface DataPoint {
  [key: string]: number;
}

export interface AnalysisResult {
  slope: number;
  intercept: number;
  rSquared: number;
  stdErr: number;
  residuals: number[];
  regressionLine: DataPoint[];
  residualPlotData: DataPoint[];
}