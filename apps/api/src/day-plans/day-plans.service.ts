import { Injectable } from '@nestjs/common';
import { DayPlan } from './day-plan.entity';
import { DayPlansRepository } from './day-plans.repository';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';

@Injectable()
export class DayPlansService {
	constructor(private readonly dayPlansRepository: DayPlansRepository) { }

	public getAllPlans(): Promise<DayPlan[]> {
		return this.dayPlansRepository.getAllPlans();
	}

	public getTodaysPlan(): Promise<DayPlan | null> {
		return this.dayPlansRepository.getPlanByDate(new Date());
	}

	public createPlanForToday(createDayPlanDto: CreateDayPlanDto): Promise<DayPlan> {
		return this.dayPlansRepository.createPlanByDate(new Date(), createDayPlanDto);
	}

	public createPlanForTomorrow(createDayPlanDto: CreateDayPlanDto): Promise<DayPlan> {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return this.dayPlansRepository.createPlanByDate(tomorrow, createDayPlanDto);
	}
}
