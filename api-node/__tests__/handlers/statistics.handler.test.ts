import { Request, Response } from 'express';
import { statisticsHandler } from '../../src/handlers/statistics.handler';
import * as service from '../../src/services/statistics.service';

jest.mock('../../src/services/statistics.service');

const mockComputeStatistics = service.computeStatistics as jest.MockedFunction<
  typeof service.computeStatistics
>;

function makeReq(body: unknown): Partial<Request> {
  return { body };
}

function makeRes(): { res: Partial<Response>; status: jest.Mock; json: jest.Mock } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status } as unknown as Partial<Response>;
  return { res, status, json };
}

describe('statisticsHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('input validation', () => {
    it('returns 400 when Q is missing', () => {
      const req = makeReq({ R: [[1]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        error: 'Request body must contain Q and R matrices',
      });
    });

    it('returns 400 when R is missing', () => {
      const req = makeReq({ Q: [[1]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        error: 'Request body must contain Q and R matrices',
      });
    });

    it('returns 400 when Q is not a 2D array of numbers', () => {
      const req = makeReq({ Q: [['a', 'b']], R: [[1]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        error: 'Q and R must be 2D arrays of finite numbers',
      });
    });

    it('returns 400 when R contains non-finite numbers', () => {
      const req = makeReq({ Q: [[1]], R: [[Infinity]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        error: 'Q and R must be 2D arrays of finite numbers',
      });
    });

    it('returns 400 when Q is a flat array instead of 2D', () => {
      const req = makeReq({ Q: [1, 2, 3], R: [[1]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        error: 'Q and R must be 2D arrays of finite numbers',
      });
    });

    it('returns 400 when Q contains null elements', () => {
      const req = makeReq({ Q: [[null, 1]], R: [[1]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
    });

    it('accepts empty 2D arrays ([])', () => {
      const mockResult = { max: 0, min: 0, average: 0, sum: 0, isDiagonal: { Q: true, R: true } };
      mockComputeStatistics.mockReturnValue(mockResult);

      const req = makeReq({ Q: [], R: [] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('successful request', () => {
    it('returns 200 with the computed result', () => {
      const mockResult = {
        max: 8,
        min: 1,
        average: 4.5,
        sum: 36,
        isDiagonal: { Q: false, R: false },
      };
      mockComputeStatistics.mockReturnValue(mockResult);

      const req = makeReq({ Q: [[1, 2], [3, 4]], R: [[5, 6], [7, 8]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(mockComputeStatistics).toHaveBeenCalledWith({
        Q: [[1, 2], [3, 4]],
        R: [[5, 6], [7, 8]],
      });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('service errors', () => {
    it('returns 500 when computeStatistics throws', () => {
      mockComputeStatistics.mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      const req = makeReq({ Q: [[1]], R: [[2]] });
      const { res, status, json } = makeRes();

      statisticsHandler(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
