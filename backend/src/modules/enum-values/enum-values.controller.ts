import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EnumValuesService } from './enum-values.service';
import { CreateEnumValueDto } from './dto/create-enum-value.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('enum-values')
@UseGuards(JwtAuthGuard)
export class EnumValuesController {
  constructor(private readonly enumValuesService: EnumValuesService) {}

  @Post()
  create(@Body() createDto: CreateEnumValueDto) {
    return this.enumValuesService.create(createDto);
  }

  @Get()
  findAll(@Query('asset_type_id') assetTypeId?: string, @Query('scope') scope?: string) {
    if (scope === 'global') {
      return this.enumValuesService.findGlobal();
    }
    if (assetTypeId) {
      return this.enumValuesService.findByAssetType(assetTypeId);
    }
    return this.enumValuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enumValuesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateEnumValueDto>) {
    return this.enumValuesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enumValuesService.remove(id);
  }
}

