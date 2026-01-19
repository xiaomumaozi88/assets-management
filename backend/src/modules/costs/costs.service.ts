import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cost } from './entities/cost.entity';

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(Cost)
    private costsRepository: Repository<Cost>,
  ) {}

  async create(createDto: any): Promise<Cost> {
    const cost = this.costsRepository.create(createDto);
    const saved = await this.costsRepository.save(cost);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findByAsset(assetId: string): Promise<Cost[]> {
    return this.costsRepository.find({
      where: { asset_id: assetId },
      order: { cost_date: 'DESC' },
    });
  }

  async getReport(filters?: any): Promise<any> {
    // 实现成本报告逻辑
    return {};
  }
}

