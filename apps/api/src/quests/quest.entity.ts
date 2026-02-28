import { Exclude } from "class-transformer";
import { User } from "src/auth/user.entity";
import { QuestCategory } from "src/quest-categories/quest-category.entity";
import { QuestEvent } from "src/quest-events/quest-event.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuestType } from "./quest-type.enum";

@Entity()
export class Quest {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    title: string;
    @Column()
    description: string;
    @Column()
    maxPoints: number;
    @Column()
    currentPoints: number;
    @Column({ type: 'enum', enum: QuestType, default: QuestType.SIMPLE_GOAL })
    questType: QuestType;
    @Column()
    createdAt: Date = new Date();
    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null = null;
    @Column({ type: 'timestamp', nullable: true })
    archivedAt: Date | null = null;
    @ManyToOne(_type => User, user => user.quests, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: User;
    @OneToMany(() => QuestEvent, (event) => event.quest)
    events: QuestEvent[];
    @ManyToOne(() => QuestCategory, category => category.quests, { nullable: true, eager: true })
    category: QuestCategory;
}