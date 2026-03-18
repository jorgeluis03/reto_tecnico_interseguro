import express, { NextFunction, Request, Response } from "express";
import { statisticsHandler } from "./handlers/statistics.handler";

export function createApp(): express.Application {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.post("/statistics", statisticsHandler);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}
