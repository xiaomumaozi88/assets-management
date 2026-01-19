import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('templates')
  createTemplate(@Body() createDto: any) {
    return this.importService.createTemplate(createDto);
  }

  @Get('templates/:assetTypeId')
  getTemplate(@Param('assetTypeId') assetTypeId: string) {
    return this.importService.getTemplate(assetTypeId);
  }

  @Post('parse-excel')
  @UseInterceptors(FileInterceptor('file'))
  parseExcel(@UploadedFile() file: Express.Multer.File) {
    return this.importService.parseExcel(file);
  }

  @Post('execute')
  @UseInterceptors(FileInterceptor('file'))
  importData(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.importService.importData(file, body.templateId);
  }
}

