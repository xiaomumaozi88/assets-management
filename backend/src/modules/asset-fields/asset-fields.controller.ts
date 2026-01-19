import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AssetFieldsService } from './asset-fields.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('asset-fields')
@UseGuards(JwtAuthGuard)
export class AssetFieldsController {
  constructor(private readonly assetFieldsService: AssetFieldsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.assetFieldsService.create(createDto);
  }

  @Get('asset-type/:assetTypeId')
  findByAssetType(@Param('assetTypeId') assetTypeId: string) {
    return this.assetFieldsService.findByAssetType(assetTypeId);
  }

  @Get('asset-template/:templateId')
  findByAssetTemplate(@Param('templateId') templateId: string) {
    return this.assetFieldsService.findByAssetTemplate(templateId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.assetFieldsService.update(id, updateDto);
    } catch (error: any) {
      console.error('Controller 错误:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || '更新字段失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetFieldsService.remove(id);
  }
}

