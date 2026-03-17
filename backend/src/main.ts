import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS：CORS_ORIGIN 为逗号分隔，如 http://8.137.120.220,http://8.137.120.220:80
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'];

  // 标准化 origin（去掉默认端口，便于比较）
  const normalizeOrigin = (urlStr: string): string => {
    try {
      const u = new URL(urlStr);
      if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
        u.port = '';
      }
      return u.origin;
    } catch {
      return urlStr;
    }
  };

  console.log('CORS Configuration:', {
    allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    corsOriginEnv: process.env.CORS_ORIGIN,
  });

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如 Postman、同源）
      if (!origin) {
        return callback(null, true);
      }

      const originNorm = normalizeOrigin(origin);
      const allowedSet = new Set(allowedOrigins.map(normalizeOrigin));

      if (allowedSet.has(originNorm)) {
        return callback(null, true);
      }
      // 开发环境放行
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      // 再检查一次原始字符串（兼容带/不带默认端口）
      if (allowedOrigins.some(allowed => normalizeOrigin(allowed) === originNorm)) {
        return callback(null, true);
      }

      console.error(`CORS: Origin ${origin} (normalized: ${originNorm}) not allowed. Allowed:`, allowedOrigins);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });
  
  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
