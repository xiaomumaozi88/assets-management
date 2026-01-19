import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AssetType } from '../../asset-types/entities/asset-type.entity';
import { Project } from '../../projects/entities/project.entity';
import { BusinessLine } from '../../business-lines/entities/business-line.entity';
import { Approval } from '../../approvals/entities/approval.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicant_id: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @Column({ type: 'uuid' })
  asset_type_id: string;

  @ManyToOne(() => AssetType, (assetType) => assetType.applications)
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @Column({ type: 'uuid', nullable: true })
  asset_template_id: string;

  @Column({ type: 'uuid', nullable: true })
  approver_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'uuid', nullable: true })
  business_line_id: string;

  @ManyToOne(() => BusinessLine)
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;

  @Column({ type: 'jsonb' })
  application_data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @OneToMany(() => Approval, (approval) => approval.application)
  approvals: Approval[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

