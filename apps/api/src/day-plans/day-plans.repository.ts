import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/auth/user.entity";
import { DataSource, Repository } from "typeorm";
import { DayBlock } from "./day-block.entity";
import { DayPlan } from "./day-plan.entity";
import { CreateDayBlockDto } from "./dto/create-day-block.dto";
import { CreateDayPlanDto } from "./dto/create-day-plan.dto";
import { ResequenceDayBlocksDto } from "./dto/resequence-day-blocks.dto";

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

	public async updatePlan(dayPlanId: string, createDayPlanDto: CreateDayPlanDto, user: User): Promise<DayPlan> {
		const { startMinutes, endMinutes } = createDayPlanDto;

		if (endMinutes <= startMinutes) {
			throw new BadRequestException('End minutes must be greater than start minutes');
		}

		return this.dataSource.transaction(async (transactionalEntityManager) => {
			const dayPlanRepository = transactionalEntityManager.getRepository(DayPlan);
			const dayBlockRepository = transactionalEntityManager.getRepository(DayBlock);

			const dayPlan = await dayPlanRepository.createQueryBuilder('dayPlan')
				.leftJoinAndSelect('dayPlan.blocks', 'block')
				.where('dayPlan.id = :dayPlanId', { dayPlanId })
				.andWhere('dayPlan.userId = :userId', { userId: user.id })
				.orderBy('block.startMinute', 'ASC')
				.getOne();

			if (!dayPlan) {
				throw new NotFoundException('Day plan not found');
			}

			const blocks = (dayPlan.blocks ?? []).sort((a, b) => a.startMinute - b.startMinute);
			const totalBlocksDuration = blocks.reduce((total, block) => total + (block.endMinute - block.startMinute), 0);
			const nextPlanDuration = endMinutes - startMinutes;

			if (totalBlocksDuration > nextPlanDuration) {
				throw new BadRequestException('Blocks do not fit in the new plan time range');
			}

			dayPlan.startMinute = startMinutes;
			dayPlan.endMinute = endMinutes;
			await dayPlanRepository.save(dayPlan);

			let cursor = startMinutes;
			for (const block of blocks) {
				const duration = block.endMinute - block.startMinute;
				block.startMinute = cursor;
				block.endMinute = cursor + duration;
				cursor = block.endMinute;
			}

			if (blocks.length > 0) {
				await dayBlockRepository.save(blocks);
			}

			const updatedPlan = await dayPlanRepository.createQueryBuilder('dayPlan')
				.leftJoinAndSelect('dayPlan.blocks', 'block')
				.where('dayPlan.id = :dayPlanId', { dayPlanId })
				.andWhere('dayPlan.userId = :userId', { userId: user.id })
				.orderBy('block.startMinute', 'ASC')
				.getOne();

			if (!updatedPlan) {
				throw new NotFoundException('Day plan not found');
			}

			return updatedPlan;
		});
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

	public async deleteBlock(dayPlanId: string, dayBlockId: string, user: User): Promise<void> {
		await this.dataSource.transaction(async (transactionalEntityManager) => {
			const dayBlockRepository = transactionalEntityManager.getRepository(DayBlock);

			const dayBlock = await dayBlockRepository.createQueryBuilder('block')
				.innerJoin('block.dayPlan', 'dayPlan')
				.where('block.id = :dayBlockId', { dayBlockId })
				.andWhere('block.dayPlanId = :dayPlanId', { dayPlanId })
				.andWhere('dayPlan.userId = :userId', { userId: user.id })
				.getOne();

			if (!dayBlock) {
				throw new NotFoundException('Day block not found');
			}

			const removedDurationMinutes = dayBlock.endMinute - dayBlock.startMinute;
			const removedEndMinute = dayBlock.endMinute;

			await dayBlockRepository.remove(dayBlock);

			if (removedDurationMinutes > 0) {
				await dayBlockRepository.createQueryBuilder()
					.update(DayBlock)
					.set({
						startMinute: () => `startMinute - ${removedDurationMinutes}`,
						endMinute: () => `endMinute - ${removedDurationMinutes}`,
					})
					.where('dayPlanId = :dayPlanId', { dayPlanId })
					.andWhere('startMinute >= :removedEndMinute', { removedEndMinute })
					.execute();
			}
		});
	}

	public async resequenceBlocks(dayPlanId: string, resequenceDayBlocksDto: ResequenceDayBlocksDto, user: User): Promise<DayPlan> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.leftJoinAndSelect('dayPlan.blocks', 'block')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.orderBy('block.startMinute', 'ASC')
			.getOne();

		if (!dayPlan) {
			throw new NotFoundException('Day plan not found');
		}

		const incomingBlocks = resequenceDayBlocksDto.blocks ?? [];
		const existingBlocks = dayPlan.blocks ?? [];

		if (incomingBlocks.length !== existingBlocks.length) {
			throw new BadRequestException('All blocks must be included in resequence payload');
		}

		const existingById = new Map(existingBlocks.map((block) => [block.id, block]));
		const seenIds = new Set<string>();

		for (const incomingBlock of incomingBlocks) {
			if (seenIds.has(incomingBlock.id)) {
				throw new BadRequestException('Duplicate block ids in resequence payload');
			}
			seenIds.add(incomingBlock.id);

			if (!existingById.has(incomingBlock.id)) {
				throw new BadRequestException('Invalid block id in resequence payload');
			}

			if (incomingBlock.endMinutes <= incomingBlock.startMinutes) {
				throw new BadRequestException('End minutes must be greater than start minutes');
			}

			if (incomingBlock.startMinutes < dayPlan.startMinute || incomingBlock.endMinutes > dayPlan.endMinute) {
				throw new BadRequestException('Block must be inside day plan bounds');
			}

			if (!incomingBlock.label.trim()) {
				throw new BadRequestException('Title is required');
			}
		}

		const sortedIncoming = [...incomingBlocks].sort((a, b) => a.startMinutes - b.startMinutes);
		for (let index = 0; index < sortedIncoming.length - 1; index += 1) {
			const current = sortedIncoming[index];
			const next = sortedIncoming[index + 1];
			if (current.endMinutes > next.startMinutes) {
				throw new BadRequestException('Block time overlaps another existing block');
			}
		}

		const dayBlockRepository = this.dataSource.getRepository(DayBlock);
		const updatedBlocks = incomingBlocks.map((incomingBlock) => {
			const existingBlock = existingById.get(incomingBlock.id)!;
			existingBlock.startMinute = incomingBlock.startMinutes;
			existingBlock.endMinute = incomingBlock.endMinutes;
			existingBlock.label = incomingBlock.label.trim();
			return existingBlock;
		});

		await dayBlockRepository.save(updatedBlocks);

		const updatedPlan = await this.createQueryBuilder('dayPlan')
			.leftJoinAndSelect('dayPlan.blocks', 'block')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.orderBy('block.startMinute', 'ASC')
			.getOne();

		if (!updatedPlan) {
			throw new NotFoundException('Day plan not found');
		}

		return updatedPlan;
	}

	private toDateOnlyString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}
}
