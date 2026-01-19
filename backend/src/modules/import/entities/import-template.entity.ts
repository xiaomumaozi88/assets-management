import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType } from '../../asset-types/entities/asset-type.entity';

export enum SourceFormat {
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('import_templates')
export class ImportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_type_id: string;

  @ManyToOne(() => AssetType, (assetType) => assetType.importTemplates)
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'varchar', length: 100 })
  template_name: string;

  @Column({
    type: 'enum',
    enum: SourceFormat,
    default: SourceFormat.CSV,
  })
  source_format: SourceFormat;

  @Column({ type: 'jsonb' })
  field_mapping: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  validation_rules: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}

