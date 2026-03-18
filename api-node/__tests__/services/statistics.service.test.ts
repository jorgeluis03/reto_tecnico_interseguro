import { computeStatistics } from '../../src/services/statistics.service';

describe('computeStatistics', () => {
  describe('statistical calculations (max, min, average, sum)', () => {
    it('computes correct stats for standard matrices', () => {
      const result = computeStatistics({
        Q: [[1, 2], [3, 4]],
        R: [[5, 6], [7, 8]],
      });

      expect(result.sum).toBe(36);
      expect(result.max).toBe(8);
      expect(result.min).toBe(1);
      expect(result.average).toBe(4.5);
    });

    it('handles negative numbers correctly', () => {
      const result = computeStatistics({
        Q: [[-3, -1]],
        R: [[2, 4]],
      });

      expect(result.sum).toBe(2);
      expect(result.max).toBe(4);
      expect(result.min).toBe(-3);
      expect(result.average).toBe(0.5);
    });

    it('handles a single element in each matrix', () => {
      const result = computeStatistics({
        Q: [[7]],
        R: [[3]],
      });

      expect(result.sum).toBe(10);
      expect(result.max).toBe(7);
      expect(result.min).toBe(3);
      expect(result.average).toBe(5);
    });

    it('handles floating point values', () => {
      const result = computeStatistics({
        Q: [[0.1, 0.2]],
        R: [[0.3]],
      });

      expect(result.sum).toBeCloseTo(0.6);
      expect(result.average).toBeCloseTo(0.2);
    });
  });

  describe('empty matrices', () => {
    it('returns zeroed result when both matrices are empty', () => {
      const result = computeStatistics({ Q: [], R: [] });

      expect(result).toEqual({
        max: 0,
        min: 0,
        average: 0,
        sum: 0,
        isDiagonal: { Q: true, R: true },
      });
    });

    it('computes correctly when one matrix is empty', () => {
      const result = computeStatistics({
        Q: [[2, 4]],
        R: [],
      });

      expect(result.sum).toBe(6);
      expect(result.max).toBe(4);
      expect(result.min).toBe(2);
      expect(result.average).toBe(3);
    });
  });

  describe('isDiagonal', () => {
    it('identifies a diagonal matrix correctly', () => {
      const result = computeStatistics({
        Q: [[1, 0], [0, 2]],
        R: [[3, 0, 0], [0, 4, 0], [0, 0, 5]],
      });

      expect(result.isDiagonal.Q).toBe(true);
      expect(result.isDiagonal.R).toBe(true);
    });

    it('identifies a non-diagonal matrix correctly', () => {
      const result = computeStatistics({
        Q: [[1, 2], [0, 3]],
        R: [[1, 0], [0, 1]],
      });

      expect(result.isDiagonal.Q).toBe(false);
      expect(result.isDiagonal.R).toBe(true);
    });

    it('returns false for non-square matrices', () => {
      const result = computeStatistics({
        Q: [[1, 0, 0], [0, 1, 0]],
        R: [[1]],
      });

      expect(result.isDiagonal.Q).toBe(false);
      expect(result.isDiagonal.R).toBe(true);
    });

    it('treats empty matrix as diagonal', () => {
      const result = computeStatistics({ Q: [], R: [] });

      expect(result.isDiagonal.Q).toBe(true);
      expect(result.isDiagonal.R).toBe(true);
    });

    it('treats 1x1 matrix as diagonal', () => {
      const result = computeStatistics({
        Q: [[99]],
        R: [[0]],
      });

      expect(result.isDiagonal.Q).toBe(true);
      expect(result.isDiagonal.R).toBe(true);
    });

    it('allows near-zero off-diagonal values (floating point tolerance)', () => {
      const result = computeStatistics({
        Q: [[1, 1e-11], [1e-11, 2]],
        R: [[1]],
      });

      expect(result.isDiagonal.Q).toBe(true);
    });

    it('rejects values at or above the tolerance threshold', () => {
      const result = computeStatistics({
        Q: [[1, 1e-10], [0, 2]],
        R: [[1]],
      });

      expect(result.isDiagonal.Q).toBe(false);
    });
  });
});
