import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { DayBlock } from './day-block.entity';
import { DayPlan } from './day-plan.entity';
import { DayPlansService } from './day-plans.service';
import { CreateDayBlockDto } from './dto/create-day-block.dto';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { ResequenceDayBlocksDto } from './dto/resequence-day-blocks.dto';

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

	@Put(':id')
	public updatePlan(
		@Param('id') dayPlanId: string,
		@Body() createDayPlanDto: CreateDayPlanDto,
		@GetUser() user: User,
	): Promise<DayPlan> {
		return this.dayPlansService.updatePlan(dayPlanId, createDayPlanDto, user);
	}

	@Delete(':id')
	public deletePlan(
		@Param('id') dayPlanId: string,
		@GetUser() user: User,
	): Promise<void> {
		return this.dayPlansService.deletePlan(dayPlanId, user);
	}

	@Post(':id/blocks')
	public createBlock(
		@Param('id') dayPlanId: string,
		@Body() createDayBlockDto: CreateDayBlockDto,
		@GetUser() user: User,
	): Promise<DayBlock> {
		return this.dayPlansService.createBlock(dayPlanId, createDayBlockDto, user);
	}

	@Put(':id/blocks/resequence')
	public resequenceBlocks(
		@Param('id') dayPlanId: string,
		@Body() resequenceDayBlocksDto: ResequenceDayBlocksDto,
		@GetUser() user: User,
	): Promise<DayPlan> {
		return this.dayPlansService.resequenceBlocks(dayPlanId, resequenceDayBlocksDto, user);
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

	@Delete(':id/blocks/:blockId')
	public deleteBlock(
		@Param('id') dayPlanId: string,
		@Param('blockId') dayBlockId: string,
		@GetUser() user: User,
	): Promise<void> {
		return this.dayPlansService.deleteBlock(dayPlanId, dayBlockId, user);
	}
}
