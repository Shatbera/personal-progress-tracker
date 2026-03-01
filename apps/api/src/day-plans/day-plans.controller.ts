import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DayPlan } from './day-plan.entity';
import { DayPlansService } from './day-plans.service';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';

@Controller('day-plan')
@UseGuards(AuthGuard())
export class DayPlansController {
	constructor(private readonly dayPlansService: DayPlansService) { }

	@Get()
	public getAllPlans(): Promise<DayPlan[]> {
		return this.dayPlansService.getAllPlans();
	}

	@Get('today')
	public getTodaysPlan(): Promise<DayPlan | null> {
		return this.dayPlansService.getTodaysPlan();
	}

	@Post('today')
	public createPlanForToday(@Body() createDayPlanDto: CreateDayPlanDto): Promise<DayPlan> {
		return this.dayPlansService.createPlanForToday(createDayPlanDto);
	}

	@Post('tomorrow')
	public createPlanForTomorrow(@Body() createDayPlanDto: CreateDayPlanDto): Promise<DayPlan> {
		return this.dayPlansService.createPlanForTomorrow(createDayPlanDto);
	}
}
