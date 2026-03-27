import { Controller, Get } from '@nestjs/common';

@Controller('api/ingestor')
export class IngestorController {
  @Get('status')
  getStatus() {
    return {
      service: 'ingestor-service',
      status: 'ok',
      pipelines: {
        marketData: { active: false, eventsProcessed: 0 },
        userTrades: { active: false, eventsProcessed: 0 },
      },
    };
  }
}
