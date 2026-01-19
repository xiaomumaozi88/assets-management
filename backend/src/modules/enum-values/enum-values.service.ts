import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnumValue, EnumValueScope } from './entities/enum-value.entity';
import { CreateEnumValueDto } from './dto/create-enum-value.dto';

@Injectable()
export class EnumValuesService {
  constructor(
    @InjectRepository(EnumValue)
    private enumValuesRepository: Repository<EnumValue>,
  ) {}

  async create(createDto: CreateEnumValueDto): Promise<EnumValue> {
    const enumValue = this.enumValuesRepository.create(createDto);
    const saved = await this.enumValuesRepository.save(enumValue);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(assetTypeId?: string, scope?: EnumValueScope): Promise<EnumValue[]> {
    const where: any = {};
    if (assetTypeId) {
      where.asset_type_id = assetTypeId;
    }
    if (scope) {
      where.scope = scope;
    }
    return this.enumValuesRepository.find({
      where,
      relations: ['assetType'],
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });
  }

  async findGlobal(): Promise<EnumValue[]> {
    return this.findAll(undefined, EnumValueScope.GLOBAL);
  }

  async findByAssetType(assetTypeId: string): Promise<EnumValue[]> {
    return this.findAll(assetTypeId, EnumValueScope.ASSET_TYPE);
  }

  async findOne(id: string): Promise<EnumValue | null> {
    return this.enumValuesRepository.findOne({
      where: { id },
      relations: ['assetType'],
    });
  }

  async update(id: string, updateDto: Partial<CreateEnumValueDto>): Promise<EnumValue | null> {
    await this.enumValuesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.enumValuesRepository.delete(id);
  }
}

