import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBusinessLineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  suffix?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsOptional()
  sort_order?: number;
}

