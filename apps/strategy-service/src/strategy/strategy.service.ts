import { Injectable } from '@nestjs/common';

export interface StrategyStatus {
  mode: string;
  engine: string;
  enabled: boolean;
  state: string;
  refreshMillis: number;
  marketsEvaluated: number;
  marketsQuoted: number;
  ordersSent: number;
  errors: number;
  lastCycleMillis: number | null;
  lastCycleAt: string | null;
  uptimeSeconds: number;
}

@Injectable()
export class StrategyService {
  getStatus(): StrategyStatus {
    return {
      mode: 'PAPER',
      engine: 'gabagool-directional',
      enabled: false,
      state: 'IDLE',
      refreshMillis: 500,
      marketsEvaluated: 0,
      marketsQuoted: 0,
      ordersSent: 0,
      errors: 0,
      lastCycleMillis: null,
      lastCycleAt: null,
      uptimeSeconds: 0,
    };
  }
}
