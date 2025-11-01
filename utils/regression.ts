
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
    throw new Error("Not enough data points for regression.");
  }

  const sumX = validData.reduce((acc, d) => acc + d[xVar], 0);
  const sumY = validData.reduce((acc, d) => acc + d[yVar], 0);
  const sumXY = validData.reduce((acc, d) => acc + d[xVar] * d[yVar], 0);
  const sumX2 = validData.reduce((acc, d) => acc + d[xVar] * d[xVar], 0);
  const sumY2 = validData.reduce((acc, d) => acc + d[yVar] * d[yVar], 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate slope (b1) and intercept (b0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssResidual = validData.reduce((acc, d) => {
    const predictedY = intercept + slope * d[xVar];
    return acc + Math.pow(d[yVar] - predictedY, 2);
  }, 0);
  
  // Handle case where all points are on the line
  if(Math.abs(ssTotal) < 1e-9) {
    // If total sum of squares is 0, all y values are the same.
    // If ssResidual is also 0, it's a perfect horizontal line fit.
    return {
        slope: 0,
        intercept,
        rSquared: 1,
        stdErr: 0,
        residuals: validData.map(() => 0),
        regressionLine: [
            { x: Math.min(...validData.map(d => d[xVar])), y: meanY },
            { x: Math.max(...validData.map(d => d[xVar])), y: meanY }
        ]
    }
  }

  const rSquared = 1 - (ssResidual / ssTotal);

  // Calculate standard error of the estimate
  const stdErr = Math.sqrt(ssResidual / (n - 2));

  // Calculate residuals and regression line
  const residuals = validData.map(d => {
    const predictedY = intercept + slope * d[xVar];
    return d[yVar] - predictedY;
  });

  const xValues = validData.map(d => d[xVar]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const regressionLine = [
    { x: minX, y: intercept + slope * minX },
    { x: maxX, y: intercept + slope * maxX }
  ];

  return {
    slope,
    intercept,
    rSquared,
    stdErr,
    residuals,
    regressionLine
  };
}
