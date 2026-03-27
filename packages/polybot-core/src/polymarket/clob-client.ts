import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ethers } from 'ethers';
import { ApiCreds, OrderBook, SignedOrder, ClobOrderType } from '../domain';
import { l1 as l1Auth, l2 as l2Auth } from './auth-headers';

const PATHS = {
  TIME: '/time',
  BOOK: '/book',
  TICK_SIZE: '/tick-size',
  NEG_RISK: '/neg-risk',
  FEE_RATE: '/fee-rate',
  MARKETS: '/markets',
  SAMPLING_MARKETS: '/sampling-markets',
  DATA_ORDER_PREFIX: '/data/order/',
  DATA_ORDERS: '/data/orders',
  DATA_TRADES: '/data/trades',
  AUTH_API_KEY: '/auth/api-key',
  AUTH_DERIVE_API_KEY: '/auth/derive-api-key',
  ORDER: '/order',
} as const;

export class PolymarketClobClient {
  private readonly http: AxiosInstance;
  private readonly chainId: number;
  private readonly useServerTime: boolean;

  private serverTimeOffsetSeconds = 0;
  private lastServerTimeSyncMs = 0;
  private readonly serverTimeTtlMs = 30_000;

  constructor(baseUrl: string, chainId: number, useServerTime: boolean) {
    this.chainId = chainId;
    this.useServerTime = useServerTime;
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 10_000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'polybot/1.0',
      },
    });
  }

  async getServerTimeSeconds(): Promise<number> {
    const resp = await this.http.get(PATHS.TIME);
    return parseInt(String(resp.data).trim(), 10);
  }

  async getOrderBook(tokenId: string): Promise<OrderBook> {
    const resp = await this.http.get(PATHS.BOOK, { params: { token_id: tokenId } });
    return resp.data as OrderBook;
  }

  async getMinimumTickSize(tokenId: string): Promise<number> {
    const resp = await this.http.get(PATHS.TICK_SIZE, { params: { token_id: tokenId } });
    return Number(resp.data.minimum_tick_size);
  }

  async isNegRisk(tokenId: string): Promise<boolean> {
    const resp = await this.http.get(PATHS.NEG_RISK, { params: { token_id: tokenId } });
    return Boolean(resp.data.neg_risk);
  }

  async getBaseFeeBps(tokenId: string): Promise<number> {
    const resp = await this.http.get(PATHS.FEE_RATE, { params: { token_id: tokenId } });
    return Number(resp.data.base_fee);
  }

  async markets(query?: Record<string, string>): Promise<unknown> {
    const resp = await this.http.get(PATHS.MARKETS, { params: query ?? {} });
    return resp.data;
  }

  async samplingMarkets(query?: Record<string, string>): Promise<unknown> {
    const resp = await this.http.get(PATHS.SAMPLING_MARKETS, { params: query ?? {} });
    return resp.data;
  }

  async getOrder(
    signer: ethers.Wallet,
    apiCreds: ApiCreds,
    orderId: string,
  ): Promise<unknown> {
    if (!orderId || orderId.trim().length === 0) {
      throw new Error('orderId must not be blank');
    }
    const endpoint = PATHS.DATA_ORDER_PREFIX + orderId.trim();
    const headers = this.l2Headers(signer, apiCreds, 'GET', endpoint, '');
    const resp = await this.http.get(endpoint, { headers });
    return resp.data;
  }

  async getOrders(
    signer: ethers.Wallet,
    apiCreds: ApiCreds,
    query?: Record<string, string>,
  ): Promise<unknown> {
    const headers = this.l2Headers(signer, apiCreds, 'GET', PATHS.DATA_ORDERS, '');
    const resp = await this.http.get(PATHS.DATA_ORDERS, { params: query ?? {}, headers });
    return resp.data;
  }

  async getTrades(
    signer: ethers.Wallet,
    apiCreds: ApiCreds,
    query?: Record<string, string>,
  ): Promise<unknown> {
    const headers = this.l2Headers(signer, apiCreds, 'GET', PATHS.DATA_TRADES, '');
    const resp = await this.http.get(PATHS.DATA_TRADES, { params: query ?? {}, headers });
    return resp.data;
  }

  async createApiCreds(
    signer: ethers.Wallet,
    nonce: number,
  ): Promise<ApiCreds> {
    const raw = await this.l1AuthRequest<ApiCredsRaw>(signer, 'POST', PATHS.AUTH_API_KEY, null, nonce);
    return toApiCreds(raw);
  }

  async deriveApiCreds(
    signer: ethers.Wallet,
    nonce: number,
  ): Promise<ApiCreds> {
    const raw = await this.l1AuthRequest<ApiCredsRaw>(signer, 'GET', PATHS.AUTH_DERIVE_API_KEY, null, nonce);
    return toApiCreds(raw);
  }

  async createOrDeriveApiCreds(
    signer: ethers.Wallet,
    nonce: number,
  ): Promise<ApiCreds> {
    try {
      const created = await this.createApiCreds(signer, nonce);
      if (created.key && created.key.trim().length > 0) return created;
    } catch {
      // fall through to derive
    }
    return this.deriveApiCreds(signer, nonce);
  }

  async postOrder(
    signer: ethers.Wallet,
    apiCreds: ApiCreds,
    order: SignedOrder,
    orderType: ClobOrderType,
    deferExec: boolean,
  ): Promise<unknown> {
    if (!order.signature || order.signature.trim().length === 0) {
      throw new Error('order.signature must be set');
    }

    const payload = {
      order: {
        salt: parseInt(order.salt, 10),
        maker: order.maker,
        signer: order.signer,
        taker: order.taker,
        tokenId: order.tokenId,
        makerAmount: order.makerAmount,
        takerAmount: order.takerAmount,
        expiration: order.expiration,
        nonce: order.nonce,
        feeRateBps: order.feeRateBps,
        side: order.side,
        signatureType: order.signatureType,
        signature: order.signature,
      },
      owner: apiCreds.key,
      orderType,
      deferExec,
    };

    const body = JSON.stringify(payload);
    const headers = this.l2Headers(signer, apiCreds, 'POST', PATHS.ORDER, body);
    const resp = await this.http.post(PATHS.ORDER, body, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    return resp.data;
  }

  async cancelOrder(
    signer: ethers.Wallet,
    apiCreds: ApiCreds,
    orderId: string,
  ): Promise<unknown> {
    const payload = { orderID: orderId };
    const body = JSON.stringify(payload);
    const headers = this.l2Headers(signer, apiCreds, 'DELETE', PATHS.ORDER, body);
    const resp = await this.http.delete(PATHS.ORDER, {
      data: body,
      headers: { ...headers, 'Content-Type': 'application/json' },
    } as AxiosRequestConfig);
    return resp.data;
  }

  // --- Private helpers ---

  private async l1AuthRequest<T>(
    signer: ethers.Wallet,
    method: string,
    path: string,
    body: string | null,
    nonce: number,
  ): Promise<T> {
    const ts = await this.authTimestampSeconds();
    const headers = await l1Auth(signer, this.chainId, ts, nonce);

    if (method === 'GET') {
      const resp = await this.http.get(path, { headers });
      return resp.data as T;
    }
    if (method === 'POST') {
      const resp = await this.http.post(path, body ?? '', {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      return resp.data as T;
    }
    throw new Error(`Unsupported L1 method: ${method}`);
  }

  private l2Headers(
    signer: ethers.Wallet,
    creds: ApiCreds,
    method: string,
    requestPath: string,
    body: string | null,
  ): Record<string, string> {
    const ts = this.authTimestampSecondsSync();
    return l2Auth(signer, creds, ts, method, requestPath, body);
  }

  private async authTimestampSeconds(): Promise<number> {
    if (!this.useServerTime) {
      return Math.floor(Date.now() / 1000);
    }
    await this.syncServerTime();
    return Math.floor(Date.now() / 1000) + this.serverTimeOffsetSeconds;
  }

  private authTimestampSecondsSync(): number {
    if (!this.useServerTime) {
      return Math.floor(Date.now() / 1000);
    }
    return Math.floor(Date.now() / 1000) + this.serverTimeOffsetSeconds;
  }

  private async syncServerTime(): Promise<void> {
    const now = Date.now();
    if (now - this.lastServerTimeSyncMs > this.serverTimeTtlMs) {
      const serverTime = await this.getServerTimeSeconds();
      const local = Math.floor(now / 1000);
      this.serverTimeOffsetSeconds = serverTime - local;
      this.lastServerTimeSyncMs = now;
    }
  }
}

interface ApiCredsRaw {
  apiKey?: string;
  secret?: string;
  passphrase?: string;
}

function toApiCreds(raw: ApiCredsRaw): ApiCreds {
  return {
    key: raw.apiKey ?? '',
    secret: raw.secret ?? '',
    passphrase: raw.passphrase ?? '',
  };
}
