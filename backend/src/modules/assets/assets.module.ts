import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { AssetHistory } from './entities/asset-history.entity';
import { AssetRelation } from './entities/asset-relation.entity';
import { AssetType } from '../asset-types/entities/asset-type.entity';
import { AssetTemplate } from '../asset-templates/entities/asset-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetHistory, AssetRelation, AssetType, AssetTemplate])],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}

