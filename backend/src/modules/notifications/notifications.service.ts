import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createDto: any): Promise<Notification> {
    const notification = this.notificationsRepository.create(createDto);
    const saved = await this.notificationsRepository.save(notification);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    await this.notificationsRepository.update(id, { is_read: true });
    return this.notificationsRepository.findOne({ where: { id } });
  }
}

