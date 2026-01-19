import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('costs')
export class Cost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset, (asset) => asset.costs)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY' })
  currency: string;

  @Column({ type: 'date' })
  cost_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}

