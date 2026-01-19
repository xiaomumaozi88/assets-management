import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Approval } from './entities/approval.entity';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private approvalsRepository: Repository<Approval>,
    private applicationsService: ApplicationsService,
  ) {}

  async create(createDto: any): Promise<Approval> {
    const approval = this.approvalsRepository.create(createDto);
    const saved = await this.approvalsRepository.save(approval);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<Approval[]> {
    return this.approvalsRepository.find({
      relations: ['application', 'approver'],
    });
  }

  async findOne(id: string): Promise<Approval | null> {
    return this.approvalsRepository.findOne({
      where: { id },
      relations: ['application', 'approver'],
    });
  }

  async findByApprover(approverId: string, status?: string): Promise<Approval[]> {
    const where: any = { approver_id: approverId };
    if (status) {
      where.status = status;
    }
    return this.approvalsRepository.find({
      where,
      relations: ['application', 'approver', 'application.applicant', 'application.assetType'],
      order: { created_at: 'DESC' },
    });
  }

  async findByApproverProcessed(approverId: string): Promise<Approval[]> {
    // 返回已处理的审批（approved 或 rejected），排除 pending
    return this.approvalsRepository.find({
      where: {
        approver_id: approverId,
        status: In(['approved', 'rejected']),
      },
      relations: ['application', 'approver', 'application.applicant', 'application.assetType'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateDto: any, userId?: string): Promise<Approval | null> {
    const approval = await this.findOne(id);
    if (!approval) return null;

    // 分离 Approval 实体的字段和 Application 的字段
    const { application_data, ...approvalUpdateData } = updateDto;
    
    // 只更新 Approval 实体的字段（status 和 comments）
    await this.approvalsRepository.update(id, approvalUpdateData);
    
    // 如果审批通过，更新申请状态并创建资产
    if (updateDto.status === 'approved' && approval.application_id) {
      // 如果提供了补充的申请数据，先更新 application_data
      if (application_data) {
        const application = await this.applicationsService.findOne(approval.application_id);
        if (application) {
          // 合并申请者预填的数据和审批人补充的数据
          const mergedData = {
            ...application.application_data,
            ...application_data,
          };
          await this.applicationsService.update(approval.application_id, {
            status: 'approved',
            application_data: mergedData,
          });
        }
      } else {
        await this.applicationsService.update(approval.application_id, { status: 'approved' });
      }
      
      if (userId) {
        await this.applicationsService.approveApplication(approval.application_id, userId);
      }
    } else if (updateDto.status === 'rejected' && approval.application_id) {
      // 如果拒绝时也提供了补充的申请数据，更新 application_data（虽然拒绝后不会创建资产，但数据应该保存）
      if (application_data) {
        const application = await this.applicationsService.findOne(approval.application_id);
        if (application) {
          // 合并申请者预填的数据和审批人补充的数据
          const mergedData = {
            ...application.application_data,
            ...application_data,
          };
          await this.applicationsService.update(approval.application_id, {
            status: 'rejected',
            application_data: mergedData,
          });
        }
      } else {
        await this.applicationsService.update(approval.application_id, { status: 'rejected' });
      }
    }

    return this.findOne(id);
  }
}

