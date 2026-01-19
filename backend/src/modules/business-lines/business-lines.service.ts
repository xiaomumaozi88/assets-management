import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessLine } from './entities/business-line.entity';
import { CreateBusinessLineDto } from './dto/create-business-line.dto';

@Injectable()
export class BusinessLinesService {
  constructor(
    @InjectRepository(BusinessLine)
    private businessLinesRepository: Repository<BusinessLine>,
  ) {}

  async create(createDto: CreateBusinessLineDto): Promise<BusinessLine> {
    const businessLine = this.businessLinesRepository.create(createDto);
    const saved = await this.businessLinesRepository.save(businessLine);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<BusinessLine[]> {
    return this.businessLinesRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BusinessLine | null> {
    return this.businessLinesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDto: Partial<CreateBusinessLineDto>): Promise<BusinessLine | null> {
    await this.businessLinesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.businessLinesRepository.delete(id);
  }
}

