
import type { DataPoint, AnalysisResult } from '../types';

export function calculateLinearRegression(
  data: DataPoint[],
  xVar: string,
  yVar: string
): AnalysisResult {
  const validData = data.filter(d => 
    typeof d[xVar] === 'number' && isFinite(d[xVar]) &&
    typeof d[yVar] === 'number' && isFinite(d[yVar])
  );

  const n = validData.length;
  if (n < 2) {
    throw new Error("NOT_ENOUGH_DATA");
  }

  const sumX = validData.reduce((acc, d) => acc + d[xVar], 0);
  const sumY = validData.reduce((acc, d) => acc + d[yVar], 0);
  const sumXY = validData.reduce((acc, d) => acc + d[xVar] * d[yVar], 0);
  const sumX2 = validData.reduce((acc, d) => acc + d[xVar] * d[xVar], 0);
  const sumY2 = validData.reduce((acc, d) => acc + d[yVar] * d[yVar], 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const sxx = sumX2 - (sumX * sumX) / n;
  if (Math.abs(sxx) < 1e-9) {
    throw new Error("IDENTICAL_X_VALUES");
  }

  // Calculate slope (b1) and intercept (b0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssResidual = validData.reduce((acc, d) => {
    const predictedY = intercept + slope * d[xVar];
    return acc + Math.pow(d[yVar] - predictedY, 2);
  }, 0);
  
  if(Math.abs(ssTotal) < 1e-9) {
    const residuals = validData.map(() => 0);
    const residualPlotData = validData.map((d, i) => ({
      [xVar]: d[xVar],
      residual: residuals[i],
    }));
    return {
        slope: 0,
        intercept,
        rSquared: 1,
        stdErr: 0,
        stdErrSlope: 0,
        stdErrIntercept: 0,
        residuals,
        regressionLine: [
            { [xVar]: Math.min(...validData.map(d => d[xVar])), y: meanY },
            { [xVar]: Math.max(...validData.map(d => d[xVar])), y: meanY }
        ],
        residualPlotData,
    }
  }

  const rSquared = 1 - (ssResidual / ssTotal);

  // Calculate standard error of the estimate (MSE)
  const stdErr = Math.sqrt(ssResidual / (n - 2));
  const mse = stdErr * stdErr;

  // Calculate standard errors for coefficients
  const stdErrSlope = Math.sqrt(mse / sxx);
  const stdErrIntercept = Math.sqrt(mse * (1 / n + (meanX * meanX) / sxx));


  // Calculate residuals and regression line
  const residuals = validData.map(d => {
    const predictedY = intercept + slope * d[xVar];
    return d[yVar] - predictedY;
  });

  const residualPlotData = validData.map((d, i) => ({
    [xVar]: d[xVar],
    residual: residuals[i],
  }));

  const xValues = validData.map(d => d[xVar]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const regressionLine: DataPoint[] = [
    { [xVar]: minX, y: intercept + slope * minX },
    { [xVar]: maxX, y: intercept + slope * maxX }
  ];

  return {
    slope,
    intercept,
    rSquared,
    stdErr,
    stdErrSlope,
    stdErrIntercept,
    residuals,
    regressionLine,
    residualPlotData
  };
}