import { Module } from '@nestjs/common';
import { StrategyStatusController } from './strategy/strategy-status.controller';
import { StrategyService } from './strategy/strategy.service';

@Module({
  controllers: [StrategyStatusController],
  providers: [StrategyService],
})
export class AppModule {}
