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
import { AssetField } from '../../asset-fields/entities/asset-field.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('asset_templates')
export class AssetTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_type_id: string;

  @ManyToOne(() => AssetType, (assetType) => assetType.templates)
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @OneToMany(() => AssetField, (field) => field.assetTemplate)
  fields: AssetField[];

  @OneToMany(() => Asset, (asset) => asset.assetTemplate)
  assets: Asset[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

