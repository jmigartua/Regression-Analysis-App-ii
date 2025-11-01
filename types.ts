
export interface DataPoint {
  [key: string]: number;
}

export interface AnalysisResult {
  slope: number;
  intercept: number;
  rSquared: number;
  stdErr: number;
  p_value_slope: number;
  p_value_intercept: number;
  residuals: number[];
  regressionLine: { x: number; y: number }[];
}
