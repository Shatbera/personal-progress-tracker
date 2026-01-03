import { Exclude } from "class-transformer";
import { User } from "src/auth/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @ManyToOne(_type => User, user => user.quests, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: User;
}