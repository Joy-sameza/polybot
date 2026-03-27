import { Module } from '@nestjs/common';
import { IngestorController } from './ingestor/ingestor.controller';
import { IngestorService } from './ingestor/ingestor.service';

@Module({
  controllers: [IngestorController],
  providers: [IngestorService],
})
export class AppModule {}
