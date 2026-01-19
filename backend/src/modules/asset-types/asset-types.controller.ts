import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('asset-types')
@UseGuards(JwtAuthGuard)
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Post()
  create(@Body() createDto: CreateAssetTypeDto) {
    return this.assetTypesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.assetTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateAssetTypeDto>) {
    return this.assetTypesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetTypesService.remove(id);
  }
}

