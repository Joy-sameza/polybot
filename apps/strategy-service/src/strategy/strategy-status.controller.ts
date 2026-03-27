import { Controller, Get } from '@nestjs/common';
import { StrategyService, StrategyStatus } from './strategy.service';

@Controller('api/strategy')
export class StrategyStatusController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get('status')
  getStatus(): StrategyStatus {
    return this.strategyService.getStatus();
  }
}
