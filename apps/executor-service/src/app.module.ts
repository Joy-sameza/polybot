import { Module } from '@nestjs/common';
import { PolymarketController } from './polymarket/polymarket.controller';
import { PolymarketAuthController } from './polymarket/polymarket-auth.controller';
import { PolymarketGammaController } from './polymarket/polymarket-gamma.controller';
import { SettlementController } from './polymarket/settlement.controller';
import { ExecutorService } from './polymarket/executor.service';

@Module({
  controllers: [
    PolymarketController,
    PolymarketAuthController,
    PolymarketGammaController,
    SettlementController,
  ],
  providers: [ExecutorService],
})
export class AppModule {}
