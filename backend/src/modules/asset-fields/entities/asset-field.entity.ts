import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType } from '../../asset-types/entities/asset-type.entity';
import { AssetTemplate } from '../../asset-templates/entities/asset-template.entity';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  URL = 'url',
  EMAIL = 'email',
  JSON = 'json',
  SELECT = 'select',
  TEXTAREA = 'textarea',
}

@Entity('asset_fields')
export class AssetField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  asset_type_id: string;

  @ManyToOne(() => AssetType, (assetType) => assetType.fields, { nullable: true })
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'uuid', nullable: true })
  asset_template_id: string;

  @ManyToOne(() => AssetTemplate, (template) => template.fields, { nullable: true })
  @JoinColumn({ name: 'asset_template_id' })
  assetTemplate: AssetTemplate;

  @Column({ type: 'varchar', length: 100 })
  field_name: string;

  @Column({ type: 'varchar', length: 100 })
  field_code: string;

  @Column({
    type: 'enum',
    enum: FieldType,
    default: FieldType.TEXT,
  })
  field_type: FieldType;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @Column({ type: 'boolean', default: false })
  require_in_application: boolean;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean; // 是否为主要字段（用于资产描述/标题）

  @Column({ type: 'text', nullable: true })
  default_value: string;

  @Column({ type: 'jsonb', nullable: true })
  validation_rule: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;
}

