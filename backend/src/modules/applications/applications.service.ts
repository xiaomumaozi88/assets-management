import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private assetsService: AssetsService,
  ) {}

  async create(createDto: any): Promise<Application> {
    // 验证必填字段：业务线必须填写
    if (!createDto.business_line_id) {
      throw new Error('业务线(business_line_id)是必填项，请选择业务线');
    }

    // 如果指定了owner_id，将其保存到application_data中，以便审批通过创建资产时使用
    const applicationData = createDto.application_data || {};
    if (createDto.owner_id) {
      applicationData.owner_id = createDto.owner_id;
    }

    const application = this.applicationsRepository.create({
      ...createDto,
      application_data: applicationData,
      status: 'pending',
    });
    const saved = await this.applicationsRepository.save(application);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<Application[]> {
    return this.applicationsRepository.find({
      relations: ['applicant', 'assetType', 'project', 'businessLine'],
      order: { created_at: 'DESC' },
    });
  }

  async findByApplicant(applicantId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { applicant_id: applicantId },
      relations: ['applicant', 'assetType', 'project', 'businessLine', 'approvals', 'approvals.approver'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Application | null> {
    return this.applicationsRepository.findOne({
      where: { id },
      relations: ['applicant', 'assetType', 'project', 'businessLine', 'approvals', 'approvals.approver'],
    });
  }

  async approveApplication(id: string, userId: string): Promise<Application | null> {
    const application = await this.findOne(id);
    if (!application) return null;

    // 更新申请状态为已通过
    await this.applicationsRepository.update(id, { status: ApplicationStatus.APPROVED });

    // 审批通过后创建资产
    if (application.asset_template_id && application.application_data) {
      // 验证业务线是否存在
      if (!application.business_line_id) {
        throw new Error('申请中缺少业务线信息，无法创建资产。请先补充业务线信息。');
      }

      // 确定所有者：优先使用申请中指定的owner_id，否则使用申请人ID
      const ownerId = application.application_data.owner_id || application.applicant_id;
      if (!ownerId) {
        throw new Error('无法确定资源所有者，请指定资源所有者。');
      }

      const assetData = {
        asset_type_id: application.asset_type_id,
        asset_template_id: application.asset_template_id,
        name: application.application_data.name || `资产-${new Date().getTime()}`,
        code: application.application_data.code,
        business_line_id: application.business_line_id,
        project_id: application.project_id,
        expiry_date: application.application_data.expiry_date,
        cost: application.application_data.cost,
        status: 'active',
        owner_id: ownerId,
        custom_fields: application.application_data,
      };

      await this.assetsService.create(assetData, userId);
    }

    return this.findOne(id);
  }

  async update(id: string, updateDto: any): Promise<Application | null> {
    await this.applicationsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async cancel(id: string, applicantId: string): Promise<Application | null> {
    const application = await this.findOne(id);
    if (!application) {
      throw new Error('申请不存在');
    }

    // 验证只有申请人可以撤回
    if (application.applicant_id !== applicantId) {
      throw new Error('只有申请人可以撤回申请');
    }

    // 只能撤回待处理状态的申请
    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error('只能撤回待处理状态的申请');
    }

    // 更新状态为已撤回
    await this.applicationsRepository.update(id, { status: ApplicationStatus.CANCELLED });
    return this.findOne(id);
  }
}

