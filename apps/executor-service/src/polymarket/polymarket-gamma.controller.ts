import { Controller, Get, Query } from '@nestjs/common';
import { ExecutorService } from './executor.service';

@Controller('api/polymarket/gamma')
export class PolymarketGammaController {
  constructor(private readonly executorService: ExecutorService) {}

  @Get('search')
  search(@Query('q') query?: string): Record<string, unknown> {
    return this.executorService.gammaSearch(query);
  }

  @Get('markets')
  getMarkets(): Record<string, unknown>[] {
    return this.executorService.gammaMarkets();
  }

  @Get('events')
  getEvents(): Record<string, unknown>[] {
    return this.executorService.gammaEvents();
  }
}
