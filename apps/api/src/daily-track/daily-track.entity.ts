import { DailyTrackEntry } from './daily-track-entry.entity';
import { Quest } from "src/quests/quest.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DailyTrack {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Quest, { eager: false, onDelete: 'CASCADE' })
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

    @OneToMany(() => DailyTrackEntry, (entry) => entry.dailyTrack)
    entries: DailyTrackEntry[];
}
