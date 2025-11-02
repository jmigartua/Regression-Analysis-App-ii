
import type { DataPoint } from '../types';

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function parseCSV(csvText: string): { data: DataPoint[], columns: string[] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
    return { data: [], columns: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data: DataPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: DataPoint = {};
    let validRow = true;
    for (let j = 0; j < headers.length; j++) {
      const value = parseFloat(values[j]);
      if (isNaN(value)) {
        // Allow rows with some non-numeric columns, but they can't be used for analysis.
        // The service layer will filter these out.
      }
      row[headers[j]] = value;
    }
    data.push(row);
  }
  return { data, columns: headers };
}
