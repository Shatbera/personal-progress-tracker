import { Quest } from "src/quests/quest.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DayTrack {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Quest, { eager: false })
    @JoinColumn()
    quest: Quest;

    @Column({ unique: true })
    questId: string;

    @Column({ type: "date" })
    startDate: Date;

    @Column({ type: "int" })
    durationDays: number;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date | null = null;

    @Column()
    createdAt: Date = new Date();
}
