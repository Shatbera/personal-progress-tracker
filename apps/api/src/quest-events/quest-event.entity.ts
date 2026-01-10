import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestEventType } from "./quest-event-type.enum";
import { User } from "src/auth/user.entity";
import { Quest } from "src/quests/quest.entity";

@Entity()
export class QuestEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    eventType: QuestEventType;
    @Column()
    pointsChanged: number;
    @Column()
    createdAt: Date = new Date();
    @ManyToOne(() => Quest, (quest) => quest.events, { onDelete: "CASCADE" })
    quest: Quest;
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;
}