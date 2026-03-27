import { Controller, Get, Post } from '@nestjs/common';
import { ExecutorService } from './executor.service';

@Controller('api/polymarket/settlement')
export class SettlementController {
  constructor(private readonly executorService: ExecutorService) {}

  @Get('config')
  getConfig(): Record<string, unknown> {
    return this.executorService.getSettlementConfig();
  }

  @Get('plan')
  getPlan(): Record<string, unknown> {
    return this.executorService.getSettlementPlan();
  }

  @Post('run')
  run(): Record<string, unknown> {
    return this.executorService.runSettlement();
  }
}
