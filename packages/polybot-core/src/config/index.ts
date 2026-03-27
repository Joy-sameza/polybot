import { TradingMode, BankrollMode } from '../domain';

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond: number;
  burst: number;
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  initialBackoffMillis: number;
  maxBackoffMillis: number;
}

export interface RestConfig {
  rateLimit: RateLimitConfig;
  retry: RetryConfig;
}

export interface AuthConfig {
  privateKey?: string;
  signatureType: number;
  funderAddress?: string;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
  nonce: number;
  autoCreateOrDeriveApiCreds: boolean;
}

export interface PolymarketConfig {
  clobRestUrl: string;
  clobWsUrl: string;
  gammaUrl: string;
  dataApiUrl: string;
  chainId: number;
  useServerTime: boolean;
  marketWsEnabled: boolean;
  userWsEnabled: boolean;
  marketAssetIds: string[];
  userMarketIds: string[];
  rest: RestConfig;
  auth: AuthConfig;
  marketWsCachePath: string;
  marketWsCacheFlushMillis: number;
  marketWsStaleTimeoutMillis: number;
  marketWsReconnectBackoffMillis: number;
}

export interface ExecutorConfig {
  baseUrl: string;
  sendLiveAck: boolean;
}

export interface RiskConfig {
  killSwitch: boolean;
  maxOrderNotionalUsd: number;
  maxOrderSize: number;
}

export interface GabagoolConfig {
  enabled: boolean;
  refreshMillis: number;
  minSecondsToEnd: number;
  maxSecondsToEnd: number;
  quoteSize: number;
  edgeMinBps: number;
  maxPositionShares: number;
  bankrollMode: BankrollMode;
  bankrollUsd: number;
  bankrollSmoothingAlpha: number;
  bankrollMinThreshold: number;
  bankrollTradingFraction: number;
  completeSetTopUpEnabled: boolean;
  completeSetTopUpSecondsToEnd: number;
  completeSetTopUpMinShares: number;
}

export interface StrategyConfig {
  gabagool: GabagoolConfig;
}

export interface HftConfig {
  mode: TradingMode;
  polymarket: PolymarketConfig;
  executor: ExecutorConfig;
  risk: RiskConfig;
  strategy: StrategyConfig;
}

export function defaultHftConfig(): HftConfig {
  return {
    mode: TradingMode.PAPER,
    polymarket: {
      clobRestUrl: 'https://clob.polymarket.com',
      clobWsUrl: 'wss://ws-subscriptions-clob.polymarket.com',
      gammaUrl: 'https://gamma-api.polymarket.com',
      dataApiUrl: 'https://data-api.polymarket.com',
      chainId: 137,
      useServerTime: true,
      marketWsEnabled: false,
      userWsEnabled: false,
      marketAssetIds: [],
      userMarketIds: [],
      rest: {
        rateLimit: { enabled: true, requestsPerSecond: 20, burst: 50 },
        retry: { enabled: true, maxAttempts: 3, initialBackoffMillis: 200, maxBackoffMillis: 2000 },
      },
      auth: {
        signatureType: 0,
        nonce: 0,
        autoCreateOrDeriveApiCreds: false,
      },
      marketWsCachePath: '',
      marketWsCacheFlushMillis: 5000,
      marketWsStaleTimeoutMillis: 60000,
      marketWsReconnectBackoffMillis: 10000,
    },
    executor: {
      baseUrl: 'http://localhost:8080',
      sendLiveAck: true,
    },
    risk: {
      killSwitch: false,
      maxOrderNotionalUsd: 0,
      maxOrderSize: 0,
    },
    strategy: {
      gabagool: {
        enabled: false,
        refreshMillis: 500,
        minSecondsToEnd: 0,
        maxSecondsToEnd: 900,
        quoteSize: 10,
        edgeMinBps: 0,
        maxPositionShares: 0,
        bankrollMode: BankrollMode.FIXED,
        bankrollUsd: 0,
        bankrollSmoothingAlpha: 0.3,
        bankrollMinThreshold: 0,
        bankrollTradingFraction: 1,
        completeSetTopUpEnabled: false,
        completeSetTopUpSecondsToEnd: 60,
        completeSetTopUpMinShares: 1,
      },
    },
  };
}
