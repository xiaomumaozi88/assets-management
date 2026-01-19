import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'];
  
  console.log('CORS Configuration:', {
    allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    corsOriginEnv: process.env.CORS_ORIGIN,
  });
  
  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如移动应用或 Postman）
      if (!origin) {
        console.log('CORS: Allowing request without origin');
        return callback(null, true);
      }
      
      console.log(`CORS: Checking origin: ${origin}`);
      
      // 检查是否完全匹配
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Origin ${origin} is allowed (exact match)`);
        return callback(null, true);
      }
      
      // 检查是否是开发环境
      if (process.env.NODE_ENV === 'development') {
        console.log(`CORS: Allowing origin ${origin} (development mode)`);
        return callback(null, true);
      }
      
      // 检查是否是以允许的域名开头（支持子路径）
      const originMatch = allowedOrigins.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          const originUrl = new URL(origin);
          const match = allowedUrl.origin === originUrl.origin;
          if (match) {
            console.log(`CORS: Origin ${origin} is allowed (domain match with ${allowed})`);
          }
          return match;
        } catch (e) {
          return false;
        }
      });
      
      if (originMatch) {
        return callback(null, true);
      }
      
      console.error(`CORS: Origin ${origin} is not allowed. Allowed origins:`, allowedOrigins);
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
