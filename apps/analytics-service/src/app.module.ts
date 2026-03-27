import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics/analytics.controller';
import { UserTradeAnalyticsController } from './analytics/user-trade-analytics.controller';
import { UserPositionAnalyticsController } from './analytics/user-position-analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  controllers: [
    AnalyticsController,
    UserTradeAnalyticsController,
    UserPositionAnalyticsController,
  ],
  providers: [AnalyticsService],
})
export class AppModule {}
