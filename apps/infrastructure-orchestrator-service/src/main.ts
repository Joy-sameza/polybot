import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.INFRA_PORT ?? 8084;
  await app.listen(port);
  console.log(`infrastructure-orchestrator-service listening on port ${port}`);
}

bootstrap();
