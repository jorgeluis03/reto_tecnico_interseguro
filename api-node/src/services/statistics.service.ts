import { MatricesPayload, StatisticsResult } from '../types';

function isDiagonalMatrix(matrix: number[][]): boolean {
  if (matrix.length === 0) return true;
  const rows = matrix.length;
  const cols = matrix[0].length;
  if (cols !== rows) return false;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) >= 1e-10) {
        return false;
      }
    }
  }
  return true;
}

export function computeStatistics(payload: MatricesPayload): StatisticsResult {
  const values = payload.Q.flat().concat(payload.R.flat());

  if (values.length === 0) {
    return { max: 0, min: 0, average: 0, sum: 0, isDiagonal: { Q: true, R: true } };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  const min = values.reduce((a, b) => Math.min(a, b), Infinity);
  const average = sum / values.length;

  return {
    max,
    min,
    average,
    sum,
    isDiagonal: {
      Q: isDiagonalMatrix(payload.Q),
      R: isDiagonalMatrix(payload.R),
    },
  };
}
