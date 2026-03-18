import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

function normalizeOrigin(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
      u.port = '';
    }
    return u.origin;
  } catch {
    return urlStr;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS_ORIGIN=* 或 CORS_ALLOW_ALL=1 时放行任意来源（仅调试用，生产建议指定具体域名）
  const allowAll =
    process.env.CORS_ALLOW_ALL === '1' ||
    process.env.CORS_ORIGIN === '*';
  const allowedOrigins =
    allowAll
      ? []
      : process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
        : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'];
  if (allowAll && process.env.NODE_ENV === 'production') {
    console.warn('CORS: allow-all is on in production (CORS_ORIGIN=* or CORS_ALLOW_ALL=1)');
  }
  const allowedSet = new Set(allowedOrigins.map(normalizeOrigin));

  console.log('CORS Configuration:', {
    allowAll,
    allowedOrigins: allowAll ? ['*'] : allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    corsOriginEnv: process.env.CORS_ORIGIN,
  });

  // 先于 CORS 中间件：显式处理 OPTIONS 预检，保证始终返回 200
  app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') return next();
    const origin = req.headers.origin as string | undefined;
    const allowOrigin =
      allowAll || process.env.NODE_ENV === 'development'
        ? origin || '*'
        : !origin || allowedSet.has(normalizeOrigin(origin))
          ? origin || allowedOrigins[0] || '*'
          : allowedOrigins[0];
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.end();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowAll || process.env.NODE_ENV === 'development') return callback(null, true);
      const originNorm = normalizeOrigin(origin);
      if (allowedSet.has(originNorm)) return callback(null, true);
      console.warn(`CORS: Origin ${origin} not in allowed list:`, allowedOrigins);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
