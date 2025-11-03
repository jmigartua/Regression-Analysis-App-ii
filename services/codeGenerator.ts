
import type { FileState } from '../types';

// A simplified version of PlotExplorerPanelProps for just the relevant styling
interface PlotStyleOptions {
  scatterColor: string;
  scatterOpacity: number;
  lineColor: string;
  lineWidth: number;
  showGrid: boolean;
}

export function generateMatplotlibCode(
    fileState: FileState, 
    plotStyles: PlotStyleOptions
): string {
    const { 
        data, 
        columns, 
        independentVar, 
        dependentVar, 
        analysisResult,
        selectedRowIndices,
        uiState 
    } = fileState;

    const { 
        xAxisLabel, 
        yAxisLabel, 
        exportConfig 
    } = uiState;
    
    // Filter for only selected rows for plotting
    const activeData = data.filter((_, index) => selectedRowIndices.has(index));

    // Convert active data to a CSV string for easy pandas import
    const header = columns.join(',');
    const rows = activeData.map(row => columns.map(col => row[col]).join(',')).join('\\n');
    const csvData = `${header}\\n${rows}`;

    const safeLabel = (label: string) => label.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const code = `
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from io import StringIO

# --- Data ---
# Your data is embedded here as a string.
# Only rows active in the plot are included.
csv_data = """${csvData}"""

# Load the data into a pandas DataFrame
df = pd.read_csv(StringIO(csv_data))

# --- Variables ---
x_var = '${independentVar}'
y_var = '${dependentVar}'

# Filter out any non-numeric or missing values that might exist
df = df.dropna(subset=[x_var, y_var])
df[x_var] = pd.to_numeric(df[x_var], errors='coerce')
df[y_var] = pd.to_numeric(df[y_var], errors='coerce')
df = df.dropna(subset=[x_var, y_var])

x_data = df[x_var]
y_data = df[y_var]

# --- Plotting ---
# For more styles, see: plt.style.available
plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(${exportConfig.width / 100}, ${exportConfig.height / 100}), dpi=${exportConfig.dpi})

# Scatter plot for observations
ax.scatter(
    x_data, 
    y_data, 
    label='Observations', 
    alpha=${plotStyles.scatterOpacity}, 
    color='${plotStyles.scatterColor}'
)

# Regression Line
${analysisResult ? `
try:
    slope = ${analysisResult.slope}
    intercept = ${analysisResult.intercept}
    r_squared = ${analysisResult.rSquared}
    
    # Create regression line data
    x_reg = np.array([x_data.min(), x_data.max()])
    y_reg = intercept + slope * x_reg
    
    # Plot the line
    ax.plot(
        x_reg, 
        y_reg, 
        color='${plotStyles.lineColor}', 
        linewidth=${plotStyles.lineWidth}, 
        label=f'Regression Line (R²={r_squared:.3f})'
    )
except Exception as e:
    print(f"Could not plot regression line: {e}")
` : '# No regression analysis result available to plot.'}

# --- Styling ---
# Use r-strings (r"...") for LaTeX compatibility in labels
ax.set_xlabel(r"${safeLabel(xAxisLabel)}", fontsize=${exportConfig.fontSize})
ax.set_ylabel(r"${safeLabel(yAxisLabel)}", fontsize=${exportConfig.fontSize})
ax.set_title(r"${safeLabel(exportConfig.title)}", fontsize=${exportConfig.fontSize * 1.2}, weight='bold')

# Legend and Grid
${exportConfig.showLegend ? `ax.legend(fontsize=${exportConfig.fontSize * 0.9})` : ''}
ax.grid(${plotStyles.showGrid})

# Tick label styling
ax.tick_params(axis='both', which='major', labelsize=${exportConfig.fontSize * 0.9})

# Set plot limits (optional, uncomment to use)
# x_domain = [${uiState.xAxisDomain[0]}, ${uiState.xAxisDomain[1]}]
# y_domain = [${uiState.yAxisDomain[0]}, ${uiState.yAxisDomain[1]}]
# if not any(d == 'auto' for d in x_domain): ax.set_xlim(x_domain)
# if not any(d == 'auto' for d in y_domain): ax.set_ylim(y_domain)

fig.tight_layout()
plt.show()

# To save the figure, uncomment the following line:
# fig.savefig('${exportConfig.fileName}.png', dpi=${exportConfig.dpi}, bbox_inches='tight')
`;
    return code.trim();
}
