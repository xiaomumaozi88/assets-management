import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAssetTemplateDto {
  @IsString()
  @IsNotEmpty()
  asset_type_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsOptional()
  sort_order?: number;
}

