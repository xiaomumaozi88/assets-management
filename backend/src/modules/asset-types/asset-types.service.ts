import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetType } from './entities/asset-type.entity';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';

@Injectable()
export class AssetTypesService {
  constructor(
    @InjectRepository(AssetType)
    private assetTypesRepository: Repository<AssetType>,
  ) {}

  async create(createDto: CreateAssetTypeDto): Promise<AssetType> {
    const assetType = this.assetTypesRepository.create(createDto);
    const saved = await this.assetTypesRepository.save(assetType);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<AssetType[]> {
    return this.assetTypesRepository.find({
      relations: ['fields'],
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetType | null> {
    return this.assetTypesRepository.findOne({
      where: { id },
      relations: ['fields'],
    });
  }

  async update(id: string, updateDto: Partial<CreateAssetTypeDto>): Promise<AssetType | null> {
    await this.assetTypesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.assetTypesRepository.delete(id);
  }
}

