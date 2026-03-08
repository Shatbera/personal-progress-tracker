import { QuestCategory } from "src/quest-categories/quest-category.entity";
import { Quest } from "src/quests/quest.entity";
import { QuestEvent } from "src/quest-events/quest-event.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DayPlan } from "./day-plan.entity";

@Entity()
export class DayBlock {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "int" })
	startMinute: number;

	@Column({ type: "int" })
	endMinute: number;

	@Column()
	dayPlanId: string;

	@ManyToOne(() => DayPlan, (dayPlan) => dayPlan.blocks, { onDelete: "CASCADE" })
	@JoinColumn({ name: "dayPlanId" })
	dayPlan: DayPlan;

	@Column()
	label: string;

	@Column({ nullable: true })
	categoryId: string | null;

	@ManyToOne(() => QuestCategory, { nullable: true, eager: false, onDelete: 'SET NULL' })
	@JoinColumn({ name: "categoryId" })
	category: QuestCategory | null;

	@Column({ default: false })
	isCompleted: boolean;

	@Column({ nullable: true })
	questId: string | null;

	@ManyToOne(() => Quest, { nullable: true, eager: false, onDelete: 'SET NULL' })
	@JoinColumn({ name: "questId" })
	quest: Quest | null;

	@Column({ nullable: true })
	questLogId: string | null;

	@ManyToOne(() => QuestEvent, { nullable: true, eager: false, onDelete: 'SET NULL' })
	@JoinColumn({ name: "questLogId" })
	questLog: QuestEvent | null;
}
