import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DayPlan } from "./day-plan.entity";
import { CreateDayPlanDto } from "./dto/create-day-plan.dto";

@Injectable()
export class DayPlansRepository extends Repository<DayPlan> {
	constructor(private readonly dataSource: DataSource) {
		super(DayPlan, dataSource.createEntityManager());
	}

	public getAllPlans(): Promise<DayPlan[]> {
		return this.find({
			relations: ["blocks"],
			order: {
				date: "ASC",
			},
		});
	}

	public async getPlanByDate(date: Date): Promise<DayPlan | null> {
		const dateOnly = this.toDateOnlyString(date);

		return this.createQueryBuilder("dayPlan")
			.leftJoinAndSelect("dayPlan.blocks", "block")
			.where("dayPlan.date = :date", { date: dateOnly })
			.orderBy("block.startMinute", "ASC")
			.getOne();
	}

	public async createPlanByDate(date: Date, createDayPlanDto: CreateDayPlanDto): Promise<DayPlan> {
		const existing = await this.getPlanByDate(date);
		if (existing) {
			return existing;
		}

		const { startMinutes, endMinutes } = createDayPlanDto;

		const dayPlan = this.create({
			date,
			startMinute: startMinutes,
			endMinute: endMinutes,
		});

		await this.save(dayPlan);
		return dayPlan;
	}

	private toDateOnlyString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}
}
