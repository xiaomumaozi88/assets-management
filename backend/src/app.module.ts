import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessLinesModule } from './modules/business-lines/business-lines.module';
import { AssetTypesModule } from './modules/asset-types/asset-types.module';
import { AssetFieldsModule } from './modules/asset-fields/asset-fields.module';
import { AssetTemplatesModule } from './modules/asset-templates/asset-templates.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { CostsModule } from './modules/costs/costs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ImportModule } from './modules/import/import.module';
import { EnumValuesModule } from './modules/enum-values/enum-values.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BusinessLinesModule,
    AssetTypesModule,
    AssetFieldsModule,
    AssetTemplatesModule,
    ProjectsModule,
    AssetsModule,
    ApplicationsModule,
    ApprovalsModule,
    CostsModule,
    NotificationsModule,
    ImportModule,
    EnumValuesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
