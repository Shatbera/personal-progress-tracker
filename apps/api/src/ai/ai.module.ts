import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlan } from 'src/day-plans/day-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DayPlan]), AuthModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
