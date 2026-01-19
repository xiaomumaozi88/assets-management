import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnumValuesService } from './enum-values.service';
import { EnumValuesController } from './enum-values.controller';
import { EnumValue } from './entities/enum-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnumValue])],
  controllers: [EnumValuesController],
  providers: [EnumValuesService],
  exports: [EnumValuesService],
})
export class EnumValuesModule {}

