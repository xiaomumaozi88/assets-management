import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetFieldsService } from './asset-fields.service';
import { AssetFieldsController } from './asset-fields.controller';
import { AssetField } from './entities/asset-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetField])],
  controllers: [AssetFieldsController],
  providers: [AssetFieldsService],
  exports: [AssetFieldsService],
})
export class AssetFieldsModule {}

