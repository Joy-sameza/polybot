import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.INGESTOR_PORT ?? 8083;
  await app.listen(port);
  console.log(`ingestor-service listening on port ${port}`);
}

bootstrap();
