import { User } from 'src/auth/user.entity';
import { Quest } from 'src/quests/quest.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: false })
    isBuiltIn: boolean;

    @ManyToOne(() => User, { nullable: true, eager: false })
    user: User | null;

    @OneToMany(() => Quest, quest => quest.category)
    quests: Quest[];
}
