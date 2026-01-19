import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';

export enum RelationType {
  DEPENDS_ON = 'depends_on',
  RELATED_TO = 'related_to',
  PARENT = 'parent',
  CHILD = 'child',
}

@Entity('asset_relations')
export class AssetRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset, (asset) => asset.relations)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'uuid' })
  related_asset_id: string;

  @ManyToOne(() => Asset, (asset) => asset.relatedAssets)
  @JoinColumn({ name: 'related_asset_id' })
  relatedAsset: Asset;

  @Column({
    type: 'enum',
    enum: RelationType,
    default: RelationType.RELATED_TO,
  })
  relation_type: RelationType;

  @CreateDateColumn()
  created_at: Date;
}

