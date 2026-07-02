export class HealthService {
  getHealthStatus() {
    return {
      status: "OK",
      database: "Connected",
      service: "Elements AI API",
      version: "1.0.0",
    };
  }
}

export const healthService = new HealthService();