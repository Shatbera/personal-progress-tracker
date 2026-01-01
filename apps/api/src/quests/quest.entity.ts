import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Quest {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    title: string;
    @Column()
    description: string;
    @Column()
    status: string;
    @Column()
    maxPoints: number;
    @Column()
    currentPoints: number;
}