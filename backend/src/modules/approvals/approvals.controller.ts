import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.approvalsService.create(createDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Request() req?: any) {
    if (req?.user?.id) {
      return this.approvalsService.findByApprover(req.user.id, status);
    }
    return this.approvalsService.findAll();
  }

  @Get('my-pending')
  findMyPending(@Request() req) {
    return this.approvalsService.findByApprover(req.user.id, 'pending');
  }

  @Get('my-processed')
  findMyProcessed(@Request() req) {
    // 返回已处理的审批（approved 或 rejected），排除 pending
    return this.approvalsService.findByApproverProcessed(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Request() req) {
    return this.approvalsService.update(id, updateDto, req.user.id);
  }
}

