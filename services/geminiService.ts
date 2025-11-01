
import { GoogleGenAI, Type } from "@google/genai";
import type { DataPoint, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    slope: { type: Type.NUMBER, description: "The slope of the regression line." },
    intercept: { type: Type.NUMBER, description: "The y-intercept of the regression line." },
    rSquared: { type: Type.NUMBER, description: "The R-squared value, indicating model fit." },
    stdErr: { type: Type.NUMBER, description: "The standard error of the estimate." },
    p_value_slope: { type: Type.NUMBER, description: "The p-value for the slope coefficient." },
    p_value_intercept: { type: Type.NUMBER, description: "The p-value for the intercept coefficient." },
    residuals: {
      type: Type.ARRAY,
      description: "An array of residual values (observed - predicted).",
      items: { type: Type.NUMBER }
    },
    regressionLine: {
      type: Type.ARRAY,
      description: "An array of {x, y} points for plotting the regression line.",
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER }
        },
        required: ["x", "y"]
      }
    }
  },
  required: ['slope', 'intercept', 'rSquared', 'stdErr', 'p_value_slope', 'p_value_intercept', 'residuals', 'regressionLine']
};

export async function performLinearRegression(
  data: DataPoint[],
  independentVar: string,
  dependentVar: string
): Promise<AnalysisResult> {
  const model = "gemini-2.5-pro";

  // Filter for valid numeric data and prepare for prompt
  const validData = data
    .map(row => ({
      [independentVar]: row[independentVar],
      [dependentVar]: row[dependentVar]
    }))
    .filter(row => 
      typeof row[independentVar] === 'number' && isFinite(row[independentVar]) &&
      typeof row[dependentVar] === 'number' && isFinite(row[dependentVar])
    );

  if (validData.length < 2) {
    throw new Error("Not enough valid numeric data points for analysis.");
  }

  // To keep the prompt size reasonable, we can sample the data if it's too large.
  // For this app, let's cap it at 500 points to ensure performance.
  const sampledData = validData.length > 500 ? 
    [...Array(500)].map(() => validData[Math.floor(Math.random() * validData.length)]) 
    : validData;

  const prompt = `
    Perform a simple linear regression analysis on the provided dataset.
    - Independent Variable (X): ${independentVar}
    - Dependent Variable (Y): ${dependentVar}

    Calculate the slope, intercept, R-squared value, standard error of the estimate, the p-values for the slope and intercept coefficients, and the residuals for each data point.
    Also, provide a set of {x, y} coordinates representing the regression line, using the min and max x-values from the dataset as endpoints.

    Dataset:
    ${JSON.stringify(sampledData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0,
      },
    });

    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);

    // Gemini might return fewer residuals if data was sampled, we need to match the original data length.
    // Let's recalculate residuals on the client-side based on the returned slope and intercept for accuracy with the full dataset.
    const fullResiduals = validData.map(p => {
        const predictedY = result.intercept + result.slope * p[independentVar];
        return p[dependentVar] - predictedY;
    });

    return { ...result, residuals: fullResiduals };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini. The model may have been unable to process the data.");
  }
}
