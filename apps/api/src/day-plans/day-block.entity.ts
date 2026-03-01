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
}
