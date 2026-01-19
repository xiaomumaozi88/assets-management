import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CostsService } from './costs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('costs')
@UseGuards(JwtAuthGuard)
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.costsService.create(createDto);
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.costsService.findByAsset(assetId);
  }

  @Get('report')
  getReport() {
    return this.costsService.getReport();
  }
}

