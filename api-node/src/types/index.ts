export interface MatricesPayload {
  Q: number[][];
  R: number[][];
}

export interface StatisticsResult {
  max: number;
  min: number;
  average: number;
  sum: number;
  isDiagonal: {
    Q: boolean;
    R: boolean;
  };
}
