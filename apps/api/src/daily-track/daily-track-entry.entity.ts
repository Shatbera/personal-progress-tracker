import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DailyTrack } from "./daily-track.entity";

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

    @Column({ type: "timestamp", nullable: true })
    checkedAt: Date | null = null;

    @Column({ default: "" })
    note: string;
}
