import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AssetTemplatesService } from './asset-templates.service';
import { CreateAssetTemplateDto } from './dto/create-asset-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('asset-templates')
@UseGuards(JwtAuthGuard)
export class AssetTemplatesController {
  constructor(private readonly templatesService: AssetTemplatesService) {}

  @Post()
  create(@Body() createDto: CreateAssetTemplateDto) {
    return this.templatesService.create(createDto);
  }

  @Get()
  findAll(@Query('asset_type_id') assetTypeId?: string) {
    return this.templatesService.findAll(assetTypeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateAssetTemplateDto>) {
    return this.templatesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}

