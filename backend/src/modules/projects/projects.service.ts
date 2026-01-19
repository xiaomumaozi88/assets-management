import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createDto: any): Promise<Project> {
    const project = this.projectsRepository.create(createDto);
    const saved = await this.projectsRepository.save(project);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['businessLine', 'owner'],
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['businessLine', 'owner'],
    });
  }

  async update(id: string, updateDto: any): Promise<Project | null> {
    await this.projectsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}

