import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BusinessLine } from '../../business-lines/entities/business-line.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'uuid' })
  business_line_id: string;

  @ManyToOne(() => BusinessLine, (businessLine) => businessLine.projects)
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => Asset, (asset) => asset.project)
  assets: Asset[];

  @CreateDateColumn()
  created_at: Date;
}

