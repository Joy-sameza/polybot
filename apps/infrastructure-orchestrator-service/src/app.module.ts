import { Module } from '@nestjs/common';
import { InfrastructureController } from './infrastructure/infrastructure.controller';
import { InfrastructureService } from './infrastructure/infrastructure.service';

@Module({
  controllers: [InfrastructureController],
  providers: [InfrastructureService],
})
export class AppModule {}
