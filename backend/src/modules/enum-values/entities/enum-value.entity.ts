import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType } from '../../asset-types/entities/asset-type.entity';

export enum EnumValueScope {
  GLOBAL = 'global', // 全局枚举（如业务线、员工名单）
  ASSET_TYPE = 'asset_type', // 资产项特定枚举
}

@Entity('enum_values')
export class EnumValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // 枚举名称（如"升级型号"、"业务线"）

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string; // 枚举代码

  @Column({
    type: 'enum',
    enum: EnumValueScope,
    default: EnumValueScope.ASSET_TYPE,
  })
  scope: EnumValueScope; // 作用域：全局或资产项特定

  @Column({ type: 'uuid', nullable: true })
  asset_type_id: string; // 如果是资产项特定，关联资产项ID

  @ManyToOne(() => AssetType, { nullable: true })
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'jsonb' })
  values: Array<{ value: string; label: string }>; // 枚举值列表

  @Column({ type: 'text', nullable: true })
  description: string; // 描述

  @Column({ type: 'int', default: 0 })
  sort_order: number; // 排序

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

