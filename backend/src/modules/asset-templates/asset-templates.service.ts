import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetTemplate } from './entities/asset-template.entity';
import { CreateAssetTemplateDto } from './dto/create-asset-template.dto';
import { AssetField } from '../asset-fields/entities/asset-field.entity';
import { Asset } from '../assets/entities/asset.entity';

@Injectable()
export class AssetTemplatesService {
  constructor(
    @InjectRepository(AssetTemplate)
    private templatesRepository: Repository<AssetTemplate>,
    @InjectRepository(AssetField)
    private assetFieldsRepository: Repository<AssetField>,
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
  ) {}

  async create(createDto: CreateAssetTemplateDto): Promise<AssetTemplate> {
    const template = this.templatesRepository.create(createDto);
    const saved = await this.templatesRepository.save(template);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(assetTypeId?: string): Promise<AssetTemplate[]> {
    const where = assetTypeId ? { asset_type_id: assetTypeId } : {};
    return this.templatesRepository.find({
      where,
      relations: ['fields'],
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetTemplate | null> {
    return this.templatesRepository.findOne({
      where: { id },
      relations: ['fields'],
    });
  }

  async update(id: string, updateDto: Partial<CreateAssetTemplateDto>): Promise<AssetTemplate | null> {
    await this.templatesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // 1. 先删除所有关联的字段
    await this.assetFieldsRepository.delete({ asset_template_id: id });
    // 2. 将关联的资产的 asset_template_id 设置为 null（不删除资产，因为资产可能还有其他重要数据）
    await this.assetsRepository.update({ asset_template_id: id }, { asset_template_id: null as any });
    // 3. 然后删除模板
    await this.templatesRepository.delete(id);
  }
}

