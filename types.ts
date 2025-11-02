
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