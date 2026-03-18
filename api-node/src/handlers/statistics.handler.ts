import { Request, Response } from "express";
import { computeStatistics } from "../services/statistics.service";
import { MatricesPayload } from "../types";

function isMatrixOfNumbers(value: unknown): value is number[][] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.every((el) => typeof el === "number" && isFinite(el)),
  );
}

export function statisticsHandler(req: Request, res: Response): void {
  const body = req.body as MatricesPayload;

  if (body.Q === undefined || body.R === undefined) {
    res
      .status(400)
      .json({ error: "Request body must contain Q and R matrices" });
    return;
  }

  if (!isMatrixOfNumbers(body.Q) || !isMatrixOfNumbers(body.R)) {
    res
      .status(400)
      .json({ error: "Q and R must be 2D arrays of finite numbers" });
    return;
  }

  try {
    const result = computeStatistics(body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
