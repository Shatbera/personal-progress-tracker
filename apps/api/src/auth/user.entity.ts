import { Quest } from "src/quests/quest.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    username: string;
    @Column()
    password: string;
    @OneToMany(_type => Quest, task => task.user, { eager: true })
    tasks: Quest[];
}