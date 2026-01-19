import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { User } from '../../users/entities/user.entity';

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  TRANSFER = 'transfer',
  DELETE = 'delete',
  RELEASE = 'release',
}

@Entity('asset_histories')
export class AssetHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset, (asset) => asset.histories)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  action_type: ActionType;

  @Column({ type: 'uuid', nullable: true })
  old_owner_id: string;

  @Column({ type: 'uuid', nullable: true })
  new_owner_id: string;

  @Column({ type: 'uuid', nullable: true })
  old_project_id: string;

  @Column({ type: 'uuid', nullable: true })
  new_project_id: string;

  @Column({ type: 'uuid', nullable: true })
  old_business_line_id: string;

  @Column({ type: 'uuid', nullable: true })
  new_business_line_id: string;

  @Column({ type: 'jsonb', nullable: true })
  field_changes: Record<string, any>;

  @Column({ type: 'uuid' })
  operator_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}

