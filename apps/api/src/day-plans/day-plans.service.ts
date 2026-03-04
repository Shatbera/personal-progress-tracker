import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { DayBlock } from './day-block.entity';
import { DayPlan } from './day-plan.entity';
import { DayPlansRepository } from './day-plans.repository';
import { CreateDayBlockDto } from './dto/create-day-block.dto';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { ResequenceDayBlocksDto } from './dto/resequence-day-blocks.dto';

@Injectable()
export class DayPlansService {
	constructor(private readonly dayPlansRepository: DayPlansRepository) { }

	public getAllPlans(user: User): Promise<DayPlan[]> {
		return this.dayPlansRepository.getAllPlans(user);
	}

	public getTodaysPlan(user: User): Promise<DayPlan | null> {
		return this.dayPlansRepository.getPlanByDate(new Date(), user);
	}

	public getTomorrowsPlan(user: User): Promise<DayPlan | null> {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return this.dayPlansRepository.getPlanByDate(tomorrow, user);
	}

	public createPlanForToday(createDayPlanDto: CreateDayPlanDto, user: User): Promise<DayPlan> {
		return this.dayPlansRepository.createPlanByDate(new Date(), createDayPlanDto, user);
	}

	public createPlanForTomorrow(createDayPlanDto: CreateDayPlanDto, user: User): Promise<DayPlan> {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return this.dayPlansRepository.createPlanByDate(tomorrow, createDayPlanDto, user);
	}

	public updatePlan(dayPlanId: string, createDayPlanDto: CreateDayPlanDto, user: User): Promise<DayPlan> {
		return this.dayPlansRepository.updatePlan(dayPlanId, createDayPlanDto, user);
	}

	public createBlock(dayPlanId: string, createDayBlockDto: CreateDayBlockDto, user: User): Promise<DayBlock> {
		return this.dayPlansRepository.createBlock(dayPlanId, createDayBlockDto, user);
	}

	public updateBlock(dayPlanId: string, dayBlockId: string, createDayBlockDto: CreateDayBlockDto, user: User): Promise<DayBlock> {
		return this.dayPlansRepository.updateBlock(dayPlanId, dayBlockId, createDayBlockDto, user);
	}

	public deleteBlock(dayPlanId: string, dayBlockId: string, user: User): Promise<void> {
		return this.dayPlansRepository.deleteBlock(dayPlanId, dayBlockId, user);
	}

	public resequenceBlocks(dayPlanId: string, resequenceDayBlocksDto: ResequenceDayBlocksDto, user: User): Promise<DayPlan> {
		return this.dayPlansRepository.resequenceBlocks(dayPlanId, resequenceDayBlocksDto, user);
	}
}
