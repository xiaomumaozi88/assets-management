import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createDto: any, @Request() req) {
    return this.applicationsService.create({
      ...createDto,
      applicant_id: req.user.id,
    });
  }

  @Get()
  findAll(@Request() req) {
    // 如果查询参数有 my=true，返回当前用户的申请
    if (req.query?.my === 'true') {
      return this.applicationsService.findByApplicant(req.user.id);
    }
    return this.applicationsService.findAll();
  }

  @Get('my')
  findMyApplications(@Request() req) {
    return this.applicationsService.findByApplicant(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.applicationsService.update(id, updateDto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.applicationsService.cancel(id, req.user.id);
  }
}

