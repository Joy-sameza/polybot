import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.ANALYTICS_PORT ?? 8082;
  await app.listen(port);
  console.log(`analytics-service listening on port ${port}`);
}

bootstrap();
