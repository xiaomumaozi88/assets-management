import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve4 } from 'dns/promises';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        // ECS/容器常无 IPv6，Supabase 域名会解析出 IPv6 导致 ENETUNREACH。仅解析 IPv4 并用于连接。
        let connectHost = host;
        if (host && host !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
          try {
            const addrs = await resolve4(host);
            if (addrs?.length) connectHost = addrs[0];
          } catch (e) {
            console.warn('Database host resolve4 failed, using hostname:', (e as Error).message);
          }
        }
        return {
          type: 'postgres',
          host: connectHost,
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
          extra: { family: 4 },
        };
      },
    }),
  ],
})
export class DatabaseModule {}

