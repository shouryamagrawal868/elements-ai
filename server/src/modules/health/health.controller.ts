import { Request, Response } from "express";
import { healthService } from "./health.service";

export class HealthController {
  getHealth(req: Request, res: Response) {
    const result = healthService.getHealthStatus();

    return res.status(200).json(result);
  }
}

export const healthController = new HealthController();