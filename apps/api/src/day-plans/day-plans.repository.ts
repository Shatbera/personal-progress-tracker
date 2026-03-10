import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/auth/user.entity";
import { DataSource, Repository } from "typeorm";
import { DayBlock } from "./day-block.entity";
import { DayPlan } from "./day-plan.entity";
import { CreateDayBlockDto } from "./dto/create-day-block.dto";
import { CreateDayPlanDto } from "./dto/create-day-plan.dto";
import { ResequenceDayBlocksDto } from "./dto/resequence-day-blocks.dto";
import { QuestCategory } from "src/quest-categories/quest-category.entity";
import { QuestEvent } from "src/quest-events/quest-event.entity";
import { QuestEventType } from "src/quest-events/quest-event-type.enum";
import { Quest } from "src/quests/quest.entity";
import { DailyTrackEntry } from "src/daily-track/daily-track-entry.entity";
import { DailyTrack } from "src/daily-track/daily-track.entity";

@Injectable()
export class DayPlansRepository extends Repository<DayPlan> {
	constructor(private readonly dataSource: DataSource) {
		super(DayPlan, dataSource.createEntityManager());
	}

	public getAllPlans(user: User): Promise<DayPlan[]> {
		return this.find({
			where: { user },
			relations: ["blocks", "blocks.category"],
			order: {
				date: "ASC",
			},
		});
	}

	public async getPlanByDate(date: Date, user: User): Promise<DayPlan | null> {
		const dateOnly = this.toDateOnlyString(date);

		return this.createQueryBuilder("dayPlan")
			.leftJoinAndSelect("dayPlan.blocks", "block")
			.leftJoinAndSelect("block.category", "blockCategory")
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
				.leftJoinAndSelect('block.category', 'blockCategory')
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
				.leftJoinAndSelect('block.category', 'blockCategory')
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

	public async deletePlan(dayPlanId: string, user: User): Promise<void> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.getOne();

		if (!dayPlan) {
			throw new NotFoundException('Day plan not found');
		}

		await this.remove(dayPlan);
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
			categoryId: createDayBlockDto.categoryId ?? null,
			questId: createDayBlockDto.questId ?? null,
		});

		const saved = await dayBlockRepository.save(dayBlock);
		return dayBlockRepository.findOne({ where: { id: saved.id }, relations: ['category'] }) as Promise<DayBlock>;
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
		if (createDayBlockDto.categoryId !== undefined) {
			dayBlock.categoryId = createDayBlockDto.categoryId ?? null;
			dayBlock.category = createDayBlockDto.categoryId
				? ({ id: createDayBlockDto.categoryId } as QuestCategory)
				: null;
		}

		if (createDayBlockDto.questId !== undefined) {
			const oldQuestId = dayBlock.questId;
			const newQuestId = createDayBlockDto.questId ?? null;

			if (oldQuestId !== newQuestId && dayBlock.isCompleted) {
				// Unlink old quest log
				if (oldQuestId && dayBlock.questLogId) {
					await this.deleteQuestLogForBlock(dayBlock.questLogId, oldQuestId, user);
					dayBlock.questLogId = null;
				}
				// Link new quest log
				if (newQuestId) {
					const questEvent = await this.createQuestLogForBlock(newQuestId, user);
					if (questEvent) {
						dayBlock.questLogId = questEvent.id;
					}
				}
			}

			dayBlock.questId = newQuestId;
		}

		const saved = await dayBlockRepository.save(dayBlock);
		return dayBlockRepository.findOne({ where: { id: saved.id }, relations: ['category'] }) as Promise<DayBlock>;
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

			// Clean up quest log if block was linked and completed
			if (dayBlock.questId && dayBlock.questLogId) {
				const questEventRepository = transactionalEntityManager.getRepository(QuestEvent);
				const questEvent = await questEventRepository.findOne({ where: { id: dayBlock.questLogId } });
				if (questEvent) {
					await questEventRepository.remove(questEvent);
				}
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

	public async toggleBlockCompletion(dayPlanId: string, dayBlockId: string, isCompleted: boolean, user: User): Promise<DayBlock> {
		const dayBlockRepository = this.dataSource.getRepository(DayBlock);

		const dayBlock = await dayBlockRepository.createQueryBuilder('block')
			.innerJoinAndSelect('block.dayPlan', 'dayPlan')
			.where('block.id = :dayBlockId', { dayBlockId })
			.andWhere('block.dayPlanId = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.getOne();

		if (!dayBlock) {
			throw new NotFoundException('Day block not found');
		}

		dayBlock.isCompleted = isCompleted;

		if (dayBlock.questId) {
			if (isCompleted && !dayBlock.questLogId) {
				const questEvent = await this.createQuestLogForBlock(dayBlock.questId, user, dayBlock.dayPlan.date);
				if (questEvent) {
					dayBlock.questLogId = questEvent.id;
				}
			} else if (!isCompleted && dayBlock.questLogId) {
				await this.deleteQuestLogForBlock(dayBlock.questLogId, dayBlock.questId, user);
				dayBlock.questLogId = null;
			}
		}

		await dayBlockRepository.save(dayBlock);
		return dayBlockRepository.findOne({ where: { id: dayBlock.id }, relations: ['category'] }) as Promise<DayBlock>;
	}

	private async createQuestLogForBlock(questId: string, user: User, dayPlanDate?: Date): Promise<QuestEvent | null> {
		const questEventRepository = this.dataSource.getRepository(QuestEvent);
		const questRepository = this.dataSource.getRepository(Quest);

		const quest = await questRepository.findOne({ where: { id: questId, user: { id: user.id } } });
		if (!quest) {
			throw new NotFoundException('Linked quest not found');
		}

		// If the daily track entry for this date is already checked, reuse its event
		if (dayPlanDate) {
			const existingEvent = await this.findExistingDailyTrackEvent(questId, dayPlanDate);
			if (existingEvent) {
				return existingEvent;
			}
		}

		const currentPoints = await this.getCurrentPointsForQuest(questId, user.id);

		if (currentPoints >= quest.maxPoints) {
			return null;
		}

		const nextPoints = currentPoints + 1;
		const justCompleted = nextPoints >= quest.maxPoints;

		if (justCompleted) {
			quest.completedAt = new Date();
			await questRepository.save(quest);
		}

		const questEvent = questEventRepository.create({
			eventType: justCompleted ? QuestEventType.COMPLETE : QuestEventType.PROGRESS,
			pointsChanged: 1,
			quest: { id: questId } as Quest,
			user,
		});
		const savedEvent = await questEventRepository.save(questEvent);

		// Sync corresponding daily track entry if one exists for this date
		if (dayPlanDate) {
			await this.markDailyTrackEntry(questId, user.id, dayPlanDate, savedEvent.id);
		}

		return savedEvent;
	}

	private async deleteQuestLogForBlock(questLogId: string, questId: string, user: User): Promise<void> {
		const questEventRepository = this.dataSource.getRepository(QuestEvent);
		const questRepository = this.dataSource.getRepository(Quest);

		// Unlink daily track entry referencing this quest event before deleting it
		const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
		await entryRepo.update({ progressQuestEventId: questLogId }, { progressQuestEventId: null });

		const questEvent = await questEventRepository.findOne({ where: { id: questLogId } });
		if (questEvent) {
			await questEventRepository.remove(questEvent);
		}

		const quest = await questRepository.findOne({ where: { id: questId, user: { id: user.id } } });
		if (quest && quest.completedAt) {
			const currentPoints = await this.getCurrentPointsForQuest(questId, user.id);
			if (currentPoints < quest.maxPoints) {
				quest.completedAt = null;
				await questRepository.save(quest);
			}
		}
	}

	private async findExistingDailyTrackEvent(questId: string, dayPlanDate: Date): Promise<QuestEvent | null> {
		const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
		const dailyTrackRepo = this.dataSource.getRepository(DailyTrack);

		const dailyTrack = await dailyTrackRepo.findOne({ where: { questId } });
		if (!dailyTrack) return null;

		const dateStr = typeof dayPlanDate === 'string'
			? (dayPlanDate as string).slice(0, 10)
			: dayPlanDate.toISOString().slice(0, 10);

		const entry = await entryRepo.createQueryBuilder('entry')
			.leftJoinAndSelect('entry.progressQuestEvent', 'progressQuestEvent')
			.where('entry.dailyTrackId = :dailyTrackId', { dailyTrackId: dailyTrack.id })
			.andWhere('entry.date = :date', { date: dateStr })
			.getOne();

		if (entry?.progressQuestEventId && entry.progressQuestEvent) {
			return entry.progressQuestEvent;
		}

		return null;
	}

	private async markDailyTrackEntry(questId: string, userId: string, dayPlanDate: Date, questEventId: string): Promise<void> {
		const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
		const dailyTrackRepo = this.dataSource.getRepository(DailyTrack);

		const dailyTrack = await dailyTrackRepo.findOne({ where: { questId } });
		if (!dailyTrack) return;

		const dateStr = typeof dayPlanDate === 'string'
			? (dayPlanDate as string).slice(0, 10)
			: dayPlanDate.toISOString().slice(0, 10);

		const entry = await entryRepo.createQueryBuilder('entry')
			.where('entry.dailyTrackId = :dailyTrackId', { dailyTrackId: dailyTrack.id })
			.andWhere('entry.date = :date', { date: dateStr })
			.getOne();

		if (entry && !entry.progressQuestEventId) {
			entry.progressQuestEventId = questEventId;
			await entryRepo.save(entry);
		}
	}

	private async getCurrentPointsForQuest(questId: string, userId: string): Promise<number> {
		const questEventRepository = this.dataSource.getRepository(QuestEvent);

		const raw = await questEventRepository.createQueryBuilder('questEvent')
			.select('COALESCE(SUM(questEvent.pointsChanged), 0)', 'points')
			.where('questEvent.questId = :questId', { questId })
			.andWhere('questEvent.userId = :userId', { userId })
			.getRawOne<{ points: string | number | null }>();

		return Number(raw?.points ?? 0);
	}

	public async updateReflection(dayPlanId: string, reflection: string, user: User): Promise<DayPlan> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.leftJoinAndSelect('dayPlan.blocks', 'block')
			.leftJoinAndSelect('block.category', 'blockCategory')
			.where('dayPlan.id = :dayPlanId', { dayPlanId })
			.andWhere('dayPlan.userId = :userId', { userId: user.id })
			.orderBy('block.startMinute', 'ASC')
			.getOne();

		if (!dayPlan) {
			throw new NotFoundException('Day plan not found');
		}

		dayPlan.reflection = reflection;
		return this.save(dayPlan);
	}

	public async resequenceBlocks(dayPlanId: string, resequenceDayBlocksDto: ResequenceDayBlocksDto, user: User): Promise<DayPlan> {
		const dayPlan = await this.createQueryBuilder('dayPlan')
			.leftJoinAndSelect('dayPlan.blocks', 'block')
			.leftJoinAndSelect('block.category', 'blockCategory')
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
		const updatedBlocks: DayBlock[] = [];

		for (const incomingBlock of incomingBlocks) {
			const existingBlock = existingById.get(incomingBlock.id)!;
			existingBlock.startMinute = incomingBlock.startMinutes;
			existingBlock.endMinute = incomingBlock.endMinutes;
			existingBlock.label = incomingBlock.label.trim();
			if (incomingBlock.categoryId !== undefined) {
				existingBlock.categoryId = incomingBlock.categoryId ?? null;
				existingBlock.category = incomingBlock.categoryId
					? ({ id: incomingBlock.categoryId } as QuestCategory)
					: null;
			}
			if (incomingBlock.questId !== undefined) {
				const oldQuestId = existingBlock.questId;
				const newQuestId = incomingBlock.questId ?? null;

				if (oldQuestId !== newQuestId && existingBlock.isCompleted) {
					if (oldQuestId && existingBlock.questLogId) {
						await this.deleteQuestLogForBlock(existingBlock.questLogId, oldQuestId, user);
						existingBlock.questLogId = null;
					}
					if (newQuestId) {
						const questEvent = await this.createQuestLogForBlock(newQuestId, user);
						if (questEvent) {
							existingBlock.questLogId = questEvent.id;
						}
					}
				}

				existingBlock.questId = newQuestId;
			}
			updatedBlocks.push(existingBlock);
		}

		await dayBlockRepository.save(updatedBlocks);

		const updatedPlan = await this.createQueryBuilder('dayPlan')
			.leftJoinAndSelect('dayPlan.blocks', 'block')
			.leftJoinAndSelect('block.category', 'blockCategory')
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
