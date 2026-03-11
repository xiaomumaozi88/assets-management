import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_tags')
@Index(['asset_id', 'tag_key']) // 复合索引，提高查询性能
@Index(['tag_key', 'tag_value']) // 用于按 TAG 筛选资产
export class AssetTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset, (asset) => asset.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'varchar', length: 100 })
  tag_key: string;

  @Column({ type: 'text' })
  tag_value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

