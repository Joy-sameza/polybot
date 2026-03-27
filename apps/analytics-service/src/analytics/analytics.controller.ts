import { Controller, Get, Query } from '@nestjs/common';

@Controller('api/analytics')
export class AnalyticsController {
  @Get('status')
  getStatus() {
    return {
      service: 'analytics-service',
      status: 'ok',
      clickhouse: 'not_connected',
      eventsCount: 0,
    };
  }

  @Get('events')
  getEvents(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return { events: [], total: 0 };
  }
}
