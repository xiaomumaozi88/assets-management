import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ImportTemplate } from './entities/import-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImportTemplate])],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}

