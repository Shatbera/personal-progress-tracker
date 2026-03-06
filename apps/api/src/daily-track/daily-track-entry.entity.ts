import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DailyTrack } from "./daily-track.entity";
import { QuestEvent } from "src/quest-events/quest-event.entity";

@Entity()
export class DailyTrackEntry {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => DailyTrack, { eager: false, onDelete: "CASCADE" })
    dailyTrack: DailyTrack;

    @Column()
    dailyTrackId: string;

    @Column({ type: "int" })
    day: number;

    @Column({ type: "date" })
    date: Date;

    // Stores the exact progress log created from checking this entry.
    @Column({ type: "uuid", nullable: true })
    progressQuestEventId: string | null = null;

    @ManyToOne(() => QuestEvent, { eager: false, nullable: true, onDelete: "SET NULL" })
    progressQuestEvent: QuestEvent | null;

    @Column({ default: "" })
    note: string;
}
