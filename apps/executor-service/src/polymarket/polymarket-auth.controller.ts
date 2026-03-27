import { Controller, Get, Post } from '@nestjs/common';
import { PolymarketAuthStatusResponse, PolymarketDeriveCredsResponse } from '@polybot/core';
import { ExecutorService } from './executor.service';

@Controller('api/polymarket/auth')
export class PolymarketAuthController {
  constructor(private readonly executorService: ExecutorService) {}

  @Get('status')
  getAuthStatus(): PolymarketAuthStatusResponse {
    return this.executorService.getAuthStatus();
  }

  @Post('derive')
  deriveCreds(): PolymarketDeriveCredsResponse {
    return this.executorService.deriveCreds();
  }
}
