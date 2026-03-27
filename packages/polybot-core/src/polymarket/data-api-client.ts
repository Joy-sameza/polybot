import axios, { AxiosInstance } from 'axios';

export class PolymarketDataApiClient {
  private readonly http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 10_000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async getTrades(
    userAddress: string,
    limit: number,
    offset: number,
  ): Promise<unknown> {
    return this.getArray('/trades', userAddress, limit, offset);
  }

  async getPositions(
    userAddress: string,
    limit: number,
    offset: number,
  ): Promise<unknown> {
    return this.getArray('/positions', userAddress, limit, offset);
  }

  private async getArray(
    path: string,
    userAddress: string,
    limit: number,
    offset: number,
  ): Promise<unknown> {
    if (!userAddress || userAddress.trim().length === 0) {
      throw new Error('userAddress must not be blank');
    }
    const resp = await this.http.get(path, {
      params: {
        user: userAddress,
        limit: Math.max(1, limit).toString(),
        offset: Math.max(0, offset).toString(),
      },
    });
    return resp.data;
  }
}
