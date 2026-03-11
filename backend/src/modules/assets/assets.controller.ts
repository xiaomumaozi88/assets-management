import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createDto: any, @Request() req) {
    return this.assetsService.create(createDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: any, @Request() req?: any) {
    // 如果查询参数有 my=true，返回当前用户的资产
    if (filters?.my === 'true' && req?.user?.id) {
      return this.assetsService.findByOwner(req.user.id);
    }
    return this.assetsService.findAll(filters);
  }

  @Get('my')
  findMyAssets(@Request() req) {
    return this.assetsService.findByOwner(req.user.id);
  }

  @Get('my/overview')
  getMyAssetsOverview(@Request() req) {
    return this.assetsService.getMyAssetsOverview(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Request() req) {
    return this.assetsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  // TAG 相关接口
  @Get(':id/tags')
  getAssetTags(@Param('id') id: string) {
    return this.assetsService.getAssetTags(id);
  }

  @Put(':id/tags')
  updateAssetTags(
    @Param('id') id: string,
    @Body() body: { tags: Array<{ key: string; value: string }> },
  ) {
    return this.assetsService.updateAssetTags(id, body.tags);
  }

  @Post(':id/tags')
  addAssetTag(
    @Param('id') id: string,
    @Body() body: { key: string; value: string },
  ) {
    return this.assetsService.addAssetTag(id, body.key, body.value);
  }

  @Delete(':id/tags/:tagId')
  removeAssetTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.assetsService.removeAssetTag(id, tagId);
  }
}

