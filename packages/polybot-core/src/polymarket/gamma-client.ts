import axios, { AxiosInstance } from 'axios';

export class PolymarketGammaClient {
  private readonly http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 10_000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'polybot/1.0',
      },
    });
  }

  async search(
    query: Record<string, string>,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get('/search', { params: query, headers });
    return resp.data;
  }

  async publicSearch(
    query: Record<string, string>,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get('/public-search', { params: query, headers });
    return resp.data;
  }

  async markets(
    query: Record<string, string>,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get('/markets', { params: query, headers });
    return resp.data;
  }

  async marketById(
    id: string,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get(`/markets/${id}`, { headers });
    return resp.data;
  }

  async events(
    query: Record<string, string>,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get('/events', { params: query, headers });
    return resp.data;
  }

  async eventById(
    id: string,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const resp = await this.http.get(`/events/${id}`, { headers });
    return resp.data;
  }
}
