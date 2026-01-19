import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BusinessLinesService } from './business-lines.service';
import { CreateBusinessLineDto } from './dto/create-business-line.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('business-lines')
@UseGuards(JwtAuthGuard)
export class BusinessLinesController {
  constructor(private readonly businessLinesService: BusinessLinesService) {}

  @Post()
  create(@Body() createDto: CreateBusinessLineDto) {
    return this.businessLinesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.businessLinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessLinesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateBusinessLineDto>) {
    return this.businessLinesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessLinesService.remove(id);
  }
}

