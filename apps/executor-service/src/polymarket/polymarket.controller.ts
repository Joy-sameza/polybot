import { Controller, Get, Post, Delete, Query, Param, Body } from '@nestjs/common';
import {
  OrderBook,
  TopOfBook,
  LimitOrderRequest,
  MarketOrderRequest,
  OrderSubmissionResult,
  PolymarketHealthResponse,
  PolymarketAccountResponse,
  PolymarketBankrollResponse,
  PolymarketPosition,
} from '@polybot/core';
import { ExecutorService } from './executor.service';

@Controller('api/polymarket')
export class PolymarketController {
  constructor(private readonly executorService: ExecutorService) {}

  @Get('health')
  getHealth(@Query('tokenId') tokenId?: string): PolymarketHealthResponse {
    return this.executorService.getHealth(tokenId);
  }

  @Get('account')
  getAccount(): PolymarketAccountResponse {
    return this.executorService.getAccount();
  }

  @Get('bankroll')
  getBankroll(): PolymarketBankrollResponse {
    return this.executorService.getBankroll();
  }

  @Get('positions')
  getPositions(): PolymarketPosition[] {
    return this.executorService.getPositions();
  }

  @Get('orderbook')
  getOrderBook(@Query('tokenId') tokenId: string): OrderBook {
    return this.executorService.getOrderBook(tokenId);
  }

  @Get('tick-size')
  getTickSize(@Query('tokenId') tokenId: string): { tokenId: string; tickSize: string } {
    return this.executorService.getTickSize(tokenId);
  }

  @Get('neg-risk')
  getNegRisk(@Query('tokenId') tokenId: string): { tokenId: string; negRisk: boolean } {
    return this.executorService.getNegRisk(tokenId);
  }

  @Get('marketdata/top')
  getTopOfBook(@Query('tokenId') tokenId: string): TopOfBook {
    return this.executorService.getTopOfBook(tokenId);
  }

  @Post('orders/limit')
  submitLimitOrder(@Body() body: LimitOrderRequest): OrderSubmissionResult {
    return this.executorService.submitLimitOrder(body);
  }

  @Post('orders/market')
  submitMarketOrder(@Body() body: MarketOrderRequest): OrderSubmissionResult {
    return this.executorService.submitMarketOrder(body);
  }

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string): Record<string, unknown> {
    return this.executorService.getOrder(orderId);
  }

  @Delete('orders/:orderId')
  cancelOrder(@Param('orderId') orderId: string): Record<string, unknown> {
    return this.executorService.cancelOrder(orderId);
  }

  @Get('orders')
  getOrders(): Record<string, unknown>[] {
    return this.executorService.getOrders();
  }

  @Get('trades')
  getTrades(): Record<string, unknown>[] {
    return this.executorService.getTrades();
  }
}
