import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AssetType } from '../../asset-types/entities/asset-type.entity';
import { AssetTemplate } from '../../asset-templates/entities/asset-template.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { BusinessLine } from '../../business-lines/entities/business-line.entity';
import { AssetHistory } from './asset-history.entity';
import { Cost } from '../../costs/entities/cost.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { AssetRelation } from './asset-relation.entity';

export enum AssetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RELEASED = 'released',
  DELETED = 'deleted',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_type_id: string;

  @ManyToOne(() => AssetType, (assetType) => assetType.assets)
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'uuid', nullable: true })
  asset_template_id: string;

  @ManyToOne(() => AssetTemplate, (template) => template.assets, { nullable: true })
  @JoinColumn({ name: 'asset_template_id' })
  assetTemplate: AssetTemplate;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code: string;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User, (user) => user.assets)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid', nullable: true })
  project_id: string;

  @ManyToOne(() => Project, (project) => project.assets)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'uuid', nullable: true })
  business_line_id: string;

  @ManyToOne(() => BusinessLine, (businessLine) => businessLine.assets)
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY' })
  cost_currency: string;

  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @ManyToOne(() => Asset, (asset) => asset.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Asset;

  @OneToMany(() => Asset, (asset) => asset.parent)
  children: Asset[];

  @OneToMany(() => AssetHistory, (history) => history.asset)
  histories: AssetHistory[];

  @OneToMany(() => Cost, (cost) => cost.asset)
  costs: Cost[];

  @OneToMany(() => Notification, (notification) => notification.asset)
  notifications: Notification[];

  @OneToMany(() => AssetRelation, (relation) => relation.asset)
  relations: AssetRelation[];

  @OneToMany(() => AssetRelation, (relation) => relation.relatedAsset)
  relatedAssets: AssetRelation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

