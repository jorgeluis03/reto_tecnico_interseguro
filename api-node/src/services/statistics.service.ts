import { MatricesPayload, StatisticsResult } from '../types';

function flatten(matrix: number[][]): number[] {
  return matrix.flat();
}

function isDiagonalMatrix(matrix: number[][]): boolean {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (i !== j && Math.abs(matrix[i][j]) >= 1e-10) {
        return false;
      }
    }
  }
  return true;
}

export function computeStatistics(payload: MatricesPayload): StatisticsResult {
  const values = [...flatten(payload.Q), ...flatten(payload.R)];

  const sum = values.reduce((acc, v) => acc + v, 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
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
