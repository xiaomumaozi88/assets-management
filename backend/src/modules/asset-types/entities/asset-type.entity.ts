import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssetField } from '../../asset-fields/entities/asset-field.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { Application } from '../../applications/entities/application.entity';
import { ImportTemplate } from '../../import/entities/import-template.entity';
import { AssetTemplate } from '../../asset-templates/entities/asset-template.entity';
import { EnumValue } from '../../enum-values/entities/enum-value.entity';

@Entity('asset_types')
export class AssetType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  fields_config: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @OneToMany(() => AssetField, (field) => field.assetType)
  fields: AssetField[];

  @OneToMany(() => Asset, (asset) => asset.assetType)
  assets: Asset[];

  @OneToMany(() => Application, (application) => application.assetType)
  applications: Application[];

  @OneToMany(() => ImportTemplate, (template) => template.assetType)
  importTemplates: ImportTemplate[];

  @OneToMany(() => AssetTemplate, (template) => template.assetType)
  templates: AssetTemplate[];

  @OneToMany(() => EnumValue, (enumValue) => enumValue.assetType)
  enumValues: EnumValue[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

