import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessLinesService } from './business-lines.service';
import { BusinessLinesController } from './business-lines.controller';
import { BusinessLine } from './entities/business-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessLine])],
  controllers: [BusinessLinesController],
  providers: [BusinessLinesService],
  exports: [BusinessLinesService],
})
export class BusinessLinesModule {}

