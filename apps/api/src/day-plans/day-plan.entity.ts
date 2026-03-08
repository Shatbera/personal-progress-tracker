import { Exclude } from "class-transformer";
import { User } from "src/auth/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

	@ManyToOne(_type => User, user => user.dayPlans, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: User;

	@Column({ type: 'text', default: '' })
	reflection: string;

	@OneToMany(() => DayBlock, (dayBlock) => dayBlock.dayPlan)
	blocks: DayBlock[];
}
