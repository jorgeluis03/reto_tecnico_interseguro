import { Request, Response } from 'express';
import { computeStatistics } from '../services/statistics.service';
import { MatricesPayload } from '../types';

export function statisticsHandler(req: Request, res: Response): void {
  const body = req.body as MatricesPayload;

  if (!body.Q || !body.R) {
    res.status(400).json({ error: 'Request body must contain Q and R matrices' });
    return;
  }

  if (!Array.isArray(body.Q) || !Array.isArray(body.R)) {
    res.status(400).json({ error: 'Q and R must be arrays' });
    return;
  }

  const result = computeStatistics(body);
  res.status(200).json(result);
}
