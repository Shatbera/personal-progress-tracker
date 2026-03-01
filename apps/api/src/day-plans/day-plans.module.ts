import { Module } from '@nestjs/common';
import { DayPlansController } from './day-plans.controller';
import { DayPlansService } from './day-plans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlan } from './day-plan.entity';
import { DayBlock } from './day-block.entity';
import { DayPlansRepository } from './day-plans.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DayPlan, DayBlock])],
  controllers: [DayPlansController],
  providers: [DayPlansService, DayPlansRepository],
  exports: [DayPlansRepository],
})
export class DayPlansModule {}
