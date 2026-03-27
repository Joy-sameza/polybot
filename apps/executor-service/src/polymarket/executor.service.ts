import { Injectable } from '@nestjs/common';
import {
  TradingMode,
  OrderBook,
  TopOfBook,
  LimitOrderRequest,
  MarketOrderRequest,
  OrderSubmissionResult,
  PolymarketHealthResponse,
  PolymarketAccountResponse,
  PolymarketBankrollResponse,
  PolymarketPosition,
  PolymarketAuthStatusResponse,
  PolymarketDeriveCredsResponse,
} from '@polybot/core';

@Injectable()
export class ExecutorService {
  getHealth(tokenId?: string): PolymarketHealthResponse {
    return {
      mode: TradingMode.PAPER,
      clobRestUrl: 'https://clob.polymarket.com',
      clobWsUrl: 'wss://ws-subscriptions-clob.polymarket.com',
      chainId: 137,
      useServerTime: true,
      marketWsEnabled: false,
      userWsEnabled: false,
      deep: false,
      tokenId: tokenId ?? null,
      serverTimeSeconds: null,
      orderBook: null,
      deepError: null,
    };
  }

  getAccount(): PolymarketAccountResponse {
    return {
      mode: TradingMode.PAPER,
      signerAddress: null,
      makerAddress: null,
      funderAddress: null,
    };
  }

  getBankroll(): PolymarketBankrollResponse {
    return {
      mode: TradingMode.PAPER,
      makerAddress: null,
      usdcBalance: 0,
      positionsCurrentValueUsd: 0,
      positionsInitialValueUsd: 0,
      totalEquityUsd: 0,
      positionsCount: 0,
      redeemablePositionsCount: 0,
      mergeablePositionsCount: 0,
      asOfMillis: Date.now(),
    };
  }

  getPositions(): PolymarketPosition[] {
    return [];
  }

  getOrderBook(tokenId: string): OrderBook {
    return {
      market: undefined,
      asset_id: tokenId,
      timestamp: new Date().toISOString(),
      hash: undefined,
      bids: [],
      asks: [],
    };
  }

  getTickSize(tokenId: string): { tokenId: string; tickSize: string } {
    return { tokenId, tickSize: '0.01' };
  }

  getNegRisk(tokenId: string): { tokenId: string; negRisk: boolean } {
    return { tokenId, negRisk: false };
  }

  getTopOfBook(tokenId: string): TopOfBook {
    return {
      bestBid: 0,
      bestAsk: 0,
      bestBidSize: 0,
      bestAskSize: 0,
      lastTradePrice: undefined,
      updatedAt: undefined,
      lastTradeAt: undefined,
    };
  }

  submitLimitOrder(req: LimitOrderRequest): OrderSubmissionResult {
    return {
      mode: TradingMode.PAPER,
      signedOrder: undefined,
      clobResponse: { status: 'PAPER_MODE', message: 'Limit order simulated' },
    };
  }

  submitMarketOrder(req: MarketOrderRequest): OrderSubmissionResult {
    return {
      mode: TradingMode.PAPER,
      signedOrder: undefined,
      clobResponse: { status: 'PAPER_MODE', message: 'Market order simulated' },
    };
  }

  getOrder(orderId: string): Record<string, unknown> {
    return { orderId, status: 'NOT_FOUND' };
  }

  cancelOrder(orderId: string): Record<string, unknown> {
    return { orderId, cancelled: false, message: 'Stub: order not found' };
  }

  getOrders(): Record<string, unknown>[] {
    return [];
  }

  getTrades(): Record<string, unknown>[] {
    return [];
  }

  getAuthStatus(): PolymarketAuthStatusResponse {
    return {
      mode: TradingMode.PAPER,
      activeProfiles: [],
      signerConfigured: false,
      signerAddress: null,
      apiCredsConfigured: false,
      autoCreateOrDeriveEnabled: false,
      configuredNonce: 0,
      clobRestUrl: 'https://clob.polymarket.com',
      envPrivateKeyPresent: false,
      envPrivateKeyLength: null,
      resolvedPrivateKeyPresent: false,
      resolvedPrivateKeyLength: null,
      resolvedAutoDeriveProperty: null,
    };
  }

  deriveCreds(): PolymarketDeriveCredsResponse {
    return {
      attempted: false,
      success: false,
      method: null,
      nonce: 0,
      error: 'Stub: not implemented',
    };
  }

  gammaSearch(query?: string): Record<string, unknown> {
    return { query: query ?? '', results: [] };
  }

  gammaMarkets(): Record<string, unknown>[] {
    return [];
  }

  gammaEvents(): Record<string, unknown>[] {
    return [];
  }

  getSettlementConfig(): Record<string, unknown> {
    return { enabled: false, mode: TradingMode.PAPER, autoSettle: false };
  }

  getSettlementPlan(): Record<string, unknown> {
    return { positions: [], actions: [], estimatedProceedsUsd: 0 };
  }

  runSettlement(): Record<string, unknown> {
    return { triggered: false, message: 'Stub: settlement not implemented' };
  }
}
