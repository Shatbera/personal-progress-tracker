import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DayBlock } from "./day-block.entity";

@Entity()
export class DayPlan {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "date" })
	date: Date;

	@Column({ type: "int" })
	startMinute: number;

	@Column({ type: "int" })
	endMinute: number;

	@OneToMany(() => DayBlock, (dayBlock) => dayBlock.dayPlan)
	blocks: DayBlock[];
}
