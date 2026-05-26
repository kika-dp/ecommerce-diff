import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

const server = express();

let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return server;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', '*').split(','),
    credentials: true,
  });

  app.setGlobalPrefix(config.get<string>('APP_GLOBAL_PREFIX', 'api'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get<string>('API_VERSION', 'v1').replace('v', ''),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  isBootstrapped = true;
  return server;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
