import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AssetHistory, ActionType } from './entities/asset-history.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(AssetHistory)
    private assetHistoryRepository: Repository<AssetHistory>,
  ) {}

  async create(createDto: any, userId: string): Promise<Asset> {
    // 验证必填字段：业务线必须填写
    if (!createDto.business_line_id) {
      throw new Error('业务线(business_line_id)是必填项，请选择业务线');
    }

    // 验证必填字段：所有者必须填写（默认使用当前用户ID）
    const ownerId = createDto.owner_id || userId;
    if (!ownerId) {
      throw new Error('所有者(owner_id)是必填项，请指定资源所有者');
    }

    const asset = this.assetsRepository.create({
      ...createDto,
      owner_id: ownerId,
      created_by: userId,
    });
    const saved = await this.assetsRepository.save(asset);
    const savedAsset = Array.isArray(saved) ? saved[0] : saved;

    // 记录创建历史
    await this.assetHistoryRepository.save({
      asset_id: savedAsset.id,
      action_type: ActionType.CREATE,
      operator_id: userId,
    });

    return savedAsset;
  }

  async findAll(filters?: any): Promise<Asset[]> {
    const queryBuilder = this.assetsRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.assetType', 'assetType')
      .leftJoinAndSelect('asset.assetTemplate', 'assetTemplate')
      .leftJoinAndSelect('asset.owner', 'owner')
      .leftJoinAndSelect('asset.project', 'project')
      .leftJoinAndSelect('asset.businessLine', 'businessLine')
      .leftJoinAndSelect('asset.children', 'children')
      .leftJoinAndSelect('asset.parent', 'parent');

    if (filters?.business_line_id) {
      queryBuilder.andWhere('asset.business_line_id = :business_line_id', {
        business_line_id: filters.business_line_id,
      });
    }
    if (filters?.asset_type_id) {
      queryBuilder.andWhere('asset.asset_type_id = :asset_type_id', {
        asset_type_id: filters.asset_type_id,
      });
    }
    if (filters?.asset_template_id) {
      queryBuilder.andWhere('asset.asset_template_id = :asset_template_id', {
        asset_template_id: filters.asset_template_id,
      });
    }
    if (filters?.owner_id) {
      queryBuilder.andWhere('asset.owner_id = :owner_id', { owner_id: filters.owner_id });
    }
    if (filters?.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === '') {
        queryBuilder.andWhere('asset.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('asset.parent_id = :parent_id', { parent_id: filters.parent_id });
      }
    }

    return queryBuilder.getMany();
  }

  async findByOwner(ownerId: string): Promise<Asset[]> {
    return this.assetsRepository.find({
      where: { owner_id: ownerId },
      relations: ['assetType', 'assetTemplate', 'owner', 'project', 'businessLine', 'children', 'parent'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Asset | null> {
    return this.assetsRepository.findOne({
      where: { id },
      relations: ['assetType', 'owner', 'project', 'businessLine', 'histories', 'costs'],
    });
  }

  async update(id: string, updateDto: any, userId: string): Promise<Asset | null> {
    const oldAsset = await this.findOne(id);
    await this.assetsRepository.update(id, {
      ...updateDto,
      updated_by: userId,
    });

    // 记录更新历史
    await this.assetHistoryRepository.save({
      asset_id: id,
      action_type: ActionType.UPDATE,
      operator_id: userId,
      field_changes: updateDto,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.assetsRepository.delete(id);
  }
}

