import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { DayPlan } from 'src/day-plans/day-plan.entity';
import { Repository } from 'typeorm';
import { DailyInsightResponseDto } from './dto/daily-insight-response.dto';

@Injectable()
export class AiService {
    constructor(@InjectRepository(DayPlan)
    private readonly dayPlansRepository: Repository<DayPlan>) { }

    public async generateDailyInsight(user: User): Promise<DailyInsightResponseDto> {

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const dateOnly = `${year}-${month}-${day}`;

        const todaysPlan = this.dayPlansRepository.createQueryBuilder("dayPlan")
            .leftJoinAndSelect("dayPlan.blocks", "block")
            .leftJoinAndSelect("block.category", "blockCategory")
            .where("dayPlan.date = :date", { date: dateOnly })
            .andWhere("dayPlan.userId = :userId", { userId: user.id })
            .orderBy("block.startMinute", "ASC")
            .getOne();

        if (!todaysPlan) {
            return { insight: "No day plan found for today. Create a day plan to get personalized insights!" };
        }
        return { insight: "This is your AI-generated daily insight. Reflect on your progress and keep pushing forward!" };
    }
}