// Vercel serverless 函数入口
// 注意：对于 NestJS，建议使用 Railway 或 Render 等支持传统 Node.js 应用的平台
// 如果必须使用 Vercel，需要将 NestJS 适配为 serverless 函数
// 这需要额外的配置和可能的重构

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;
let handler: any = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      bodyParser: true,
      logger: process.env.NODE_ENV === 'production' ? false : ['error', 'warn', 'log'],
    });

    // 启用CORS
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'];
    
    app.enableCors({
      origin: (origin: string | undefined, callback: any) => {
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Authorization'],
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
    
    await app.init();
    handler = app.getHttpAdapter().getInstance();
  }
  return handler;
}

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await bootstrap();
  return expressApp(req, res);
}
