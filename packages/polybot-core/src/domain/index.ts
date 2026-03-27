export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export function orderSideToEip712Value(side: OrderSide): number {
  return side === OrderSide.BUY ? 0 : 1;
}

export enum ClobOrderType {
  GTC = 'GTC',
  FOK = 'FOK',
  GTD = 'GTD',
  FAK = 'FAK',
}

export enum TradingMode {
  PAPER = 'PAPER',
  LIVE = 'LIVE',
}

export enum BankrollMode {
  FIXED = 'FIXED',
  AUTO_EQUITY = 'AUTO_EQUITY',
  AUTO_CASH = 'AUTO_CASH',
}

export interface OrderBookLevel {
  price: string;
  size: string;
}

export interface OrderBook {
  market?: string;
  asset_id?: string;
  timestamp?: string;
  hash?: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface SignedOrder {
  salt: string;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  side: OrderSide;
  signatureType: number;
  signature: string;
}

export interface TopOfBook {
  bestBid: number;
  bestAsk: number;
  bestBidSize: number;
  bestAskSize: number;
  lastTradePrice?: number;
  updatedAt?: string;
  lastTradeAt?: string;
}

export interface ApiCreds {
  key: string;
  secret: string;
  passphrase: string;
}

export interface LimitOrderRequest {
  tokenId: string;
  side: OrderSide;
  price: number;
  size: number;
  orderType?: ClobOrderType;
  tickSize?: number;
  negRisk?: boolean;
  feeRateBps?: number;
  nonce?: number;
  expirationSeconds?: number;
  taker?: string;
  deferExec?: boolean;
}

export interface MarketOrderRequest {
  tokenId: string;
  side: OrderSide;
  amount: number;
  price: number;
  orderType?: ClobOrderType;
  tickSize?: number;
  negRisk?: boolean;
  feeRateBps?: number;
  nonce?: number;
  taker?: string;
  deferExec?: boolean;
}

export interface OrderSubmissionResult {
  mode: string;
  signedOrder?: SignedOrder;
  clobResponse?: Record<string, unknown>;
}

export interface PolymarketAccountResponse {
  mode: string;
  signerAddress: string | null;
  makerAddress: string | null;
  funderAddress: string | null;
}

export interface PolymarketBankrollResponse {
  mode: string;
  makerAddress: string | null;
  usdcBalance: number;
  positionsCurrentValueUsd: number;
  positionsInitialValueUsd: number;
  totalEquityUsd: number;
  positionsCount: number;
  redeemablePositionsCount: number;
  mergeablePositionsCount: number;
  asOfMillis: number;
}

export interface PolymarketHealthResponse {
  mode: string;
  clobRestUrl: string;
  clobWsUrl: string;
  chainId: number;
  useServerTime: boolean;
  marketWsEnabled: boolean;
  userWsEnabled: boolean;
  deep: boolean;
  tokenId: string | null;
  serverTimeSeconds: number | null;
  orderBook: OrderBook | null;
  deepError: string | null;
}

export interface PolymarketAuthStatusResponse {
  mode: string;
  activeProfiles: string[];
  signerConfigured: boolean;
  signerAddress: string | null;
  apiCredsConfigured: boolean;
  autoCreateOrDeriveEnabled: boolean;
  configuredNonce: number;
  clobRestUrl: string;
  envPrivateKeyPresent: boolean;
  envPrivateKeyLength: number | null;
  resolvedPrivateKeyPresent: boolean;
  resolvedPrivateKeyLength: number | null;
  resolvedAutoDeriveProperty: string | null;
}

export interface PolymarketDeriveCredsResponse {
  attempted: boolean;
  success: boolean;
  method: string | null;
  nonce: number;
  error: string | null;
}

export interface PolymarketPosition {
  proxyWallet?: string;
  asset?: string;
  conditionId?: string;
  size?: number;
  avgPrice?: number;
  initialValue?: number;
  currentValue?: number;
  cashPnl?: number;
  realizedPnl?: number;
  curPrice?: number;
  redeemable?: boolean;
  mergeable?: boolean;
  title?: string;
  slug?: string;
  outcome?: string;
  outcomeIndex?: number;
  oppositeOutcome?: string;
  oppositeAsset?: string;
  negativeRisk?: boolean;
}
