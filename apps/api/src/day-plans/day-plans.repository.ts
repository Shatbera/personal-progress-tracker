import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/auth/user.entity";
import { DataSource, Repository } from "typeorm";
import { DayBlock } from "./day-block.entity";
import { DayPlan } from "./day-plan.entity";
import { CreateDayBlockDto } from "./dto/create-day-block.dto";
import { CreateDayPlanDto } from "./dto/create-day-plan.dto";

@Injectable()
export class DayPlansRepository extends Repository<DayPlan> {
	constructor(private readonly dataSource: DataSource) {
		super(DayPlan, dataSource.createEntityManager());
	}

	public getAllPlans(user: User): Promise<DayPlan[]> {
		return this.find({
			where: { user },
			relations: ["blocks"],
			order: {
				date: "ASC",
			},
		});
	}

	public async getPlanByDate(date: Date, user: User): Promise<DayPlan | null> {
		const dateOnly = this.toDateOnlyString(date);

		return this.createQueryBuilder("dayPlan")
			.leftJoinAndSelect("dayPlan.blocks", "block")
			.where("dayPlan.date = :date", { date: dateOnly })
			.andWhere("dayPlan.userId = :userId", { userId: user.id })
			.orderBy("block.startMinute", "ASC")
			.getOne();
	}

	public async createPlanByDate(date: Date, createDayPlanDto: CreateDayPlanDto, user: User): Promise<DayPlan> {
		const existing = await this.getPlanByDate(date, user);
		if (existing) {
			return existing;
		}

		const { startMinutes, endMinutes } = createDayPlanDto;

		const dayPlan = this.create({
			date,
			startMinute: startMinutes,
			endMinute: endMinutes,
			user,
		});

		await this.save(dayPlan);
		return dayPlan;
	}

	public async createBlock(dayPlanId: string, createDayBlockDto: CreateDayBlockDto, user: User): Promise<DayBlock> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.getOne();

		if (!dayPlan) {
			throw new NotFoundException('Day plan not found');
		}

		const { startMinutes, endMinutes, label } = createDayBlockDto;

		if (endMinutes <= startMinutes) {
			throw new BadRequestException('End minutes must be greater than start minutes');
		}

		if (startMinutes < dayPlan.startMinute || endMinutes > dayPlan.endMinute) {
			throw new BadRequestException('Block must be inside day plan bounds');
		}

		const dayBlockRepository = this.dataSource.getRepository(DayBlock);
		const conflictingBlock = await dayBlockRepository.createQueryBuilder('block')
			.where('block.dayPlanId = :dayPlanId', { dayPlanId: dayPlan.id })
			.andWhere('block.startMinute < :endMinutes', { endMinutes })
			.andWhere('block.endMinute > :startMinutes', { startMinutes })
			.getOne();

		if (conflictingBlock) {
			throw new BadRequestException('Block time overlaps another existing block');
		}

		const dayBlock = dayBlockRepository.create({
			startMinute: startMinutes,
			endMinute: endMinutes,
			label,
			dayPlan,
			dayPlanId: dayPlan.id,
		});

		return dayBlockRepository.save(dayBlock);
	}

	public async updateBlock(dayPlanId: string, dayBlockId: string, createDayBlockDto: CreateDayBlockDto, user: User): Promise<DayBlock> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.getOne();

		if (!dayPlan) {
			throw new NotFoundException('Day plan not found');
		}

		const { startMinutes, endMinutes, label } = createDayBlockDto;

		if (endMinutes <= startMinutes) {
			throw new BadRequestException('End minutes must be greater than start minutes');
		}

		if (startMinutes < dayPlan.startMinute || endMinutes > dayPlan.endMinute) {
			throw new BadRequestException('Block must be inside day plan bounds');
		}

		const trimmedLabel = label.trim();
		if (!trimmedLabel) {
			throw new BadRequestException('Title is required');
		}

		const dayBlockRepository = this.dataSource.getRepository(DayBlock);
		const conflictingBlock = await dayBlockRepository.createQueryBuilder('block')
			.where('block.dayPlanId = :dayPlanId', { dayPlanId: dayPlan.id })
			.andWhere('block.id != :dayBlockId', { dayBlockId })
			.andWhere('block.startMinute < :endMinutes', { endMinutes })
			.andWhere('block.endMinute > :startMinutes', { startMinutes })
			.getOne();

		if (conflictingBlock) {
			throw new BadRequestException('Block time overlaps another existing block');
		}

		const dayBlock = await dayBlockRepository.createQueryBuilder('block')
			.innerJoin('block.dayPlan', 'dayPlan')
			.where('block.id = :dayBlockId', { dayBlockId })
			.andWhere('block.dayPlanId = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.getOne();

		if (!dayBlock) {
			throw new NotFoundException('Day block not found');
		}

		dayBlock.startMinute = startMinutes;
		dayBlock.endMinute = endMinutes;
		dayBlock.label = trimmedLabel;

		return dayBlockRepository.save(dayBlock);
	}

	private toDateOnlyString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}
}
