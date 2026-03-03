import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { DayBlock } from './day-block.entity';
import { DayPlan } from './day-plan.entity';
import { DayPlansService } from './day-plans.service';
import { CreateDayBlockDto } from './dto/create-day-block.dto';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';

@Controller('day-plan')
@UseGuards(AuthGuard('jwt'))
export class DayPlansController {
	constructor(private readonly dayPlansService: DayPlansService) { }

	@Get()
	public getAllPlans(@GetUser() user: User): Promise<DayPlan[]> {
		return this.dayPlansService.getAllPlans(user);
	}

	@Get('today')
	public getTodaysPlan(@GetUser() user: User): Promise<DayPlan | null> {
		return this.dayPlansService.getTodaysPlan(user);
	}

	@Get('tomorrow')
	public getTomorrowsPlan(@GetUser() user: User): Promise<DayPlan | null> {
		return this.dayPlansService.getTomorrowsPlan(user);
	}

	@Post('today')
	public createPlanForToday(
		@Body() createDayPlanDto: CreateDayPlanDto,
		@GetUser() user: User,
	): Promise<DayPlan> {
		return this.dayPlansService.createPlanForToday(createDayPlanDto, user);
	}

	@Post('tomorrow')
	public createPlanForTomorrow(
		@Body() createDayPlanDto: CreateDayPlanDto,
		@GetUser() user: User,
	): Promise<DayPlan> {
		return this.dayPlansService.createPlanForTomorrow(createDayPlanDto, user);
	}

	@Post(':id/blocks')
	public createBlock(
		@Param('id') dayPlanId: string,
		@Body() createDayBlockDto: CreateDayBlockDto,
		@GetUser() user: User,
	): Promise<DayBlock> {
		return this.dayPlansService.createBlock(dayPlanId, createDayBlockDto, user);
	}

	@Put(':id/blocks/:blockId')
	public updateBlock(
		@Param('id') dayPlanId: string,
		@Param('blockId') dayBlockId: string,
		@Body() createDayBlockDto: CreateDayBlockDto,
		@GetUser() user: User,
	): Promise<DayBlock> {
		return this.dayPlansService.updateBlock(dayPlanId, dayBlockId, createDayBlockDto, user);
	}
}
