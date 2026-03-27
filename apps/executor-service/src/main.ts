import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.EXECUTOR_PORT ?? 8080;
  await app.listen(port);
  console.log(`executor-service listening on :${port}`);
}
bootstrap();
