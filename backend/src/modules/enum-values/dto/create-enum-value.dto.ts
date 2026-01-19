import { IsString, IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { EnumValueScope } from '../entities/enum-value.entity';

export class CreateEnumValueDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(EnumValueScope)
  @IsOptional()
  scope?: EnumValueScope;

  @IsUUID()
  @IsOptional()
  asset_type_id?: string;

  @IsArray()
  values: Array<{ value: string; label: string }>;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  sort_order?: number;
}

