import express from 'express';
import { statisticsHandler } from './handlers/statistics.handler';

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.post('/statistics', statisticsHandler);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
