import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('business_lines')
export class BusinessLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  suffix: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @OneToMany(() => Project, (project) => project.businessLine)
  projects: Project[];

  @OneToMany(() => Asset, (asset) => asset.businessLine)
  assets: Asset[];

  @CreateDateColumn()
  created_at: Date;
}

