import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTemplatesService } from './asset-templates.service';
import { AssetTemplatesController } from './asset-templates.controller';
import { AssetTemplate } from './entities/asset-template.entity';
import { AssetField } from '../asset-fields/entities/asset-field.entity';
import { Asset } from '../assets/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetTemplate, AssetField, Asset])],
  controllers: [AssetTemplatesController],
  providers: [AssetTemplatesService],
  exports: [AssetTemplatesService],
})
export class AssetTemplatesModule {}

