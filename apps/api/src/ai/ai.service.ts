import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { DayPlan } from 'src/day-plans/day-plan.entity';
import { Repository } from 'typeorm';
import { DailyInsightResponseDto } from './dto/daily-insight-response.dto';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    constructor(@InjectRepository(DayPlan)
    private readonly dayPlansRepository: Repository<DayPlan>, private configService: ConfigService) { }

    public async generateDailyInsight(user: User): Promise<DailyInsightResponseDto> {
        const key = this.configService.get('OPENAI_API_KEY');
        console.log('OPENAI_API_KEY exists:', !!key);
        try {
            const client = new OpenAI({
                apiKey: key,
            });

            const response = await client.responses.create({
                model: 'gpt-5.2',
                input: 'Tell me one short joke.',
            });

            return { insight: response.output_text };
        } catch (error) {
            console.error('OpenAI error:', error);
            throw new InternalServerErrorException('Failed to generate AI insight');
        }
    }
}


        // const date = new Date();
        // const year = date.getFullYear();
        // const month = String(date.getMonth() + 1).padStart(2, "0");
        // const day = String(date.getDate()).padStart(2, "0");

        // const dateOnly = `${year}-${month}-${day}`;

        // const todaysPlan = await this.dayPlansRepository.createQueryBuilder("dayPlan")
        //     .leftJoinAndSelect("dayPlan.blocks", "block")
        //     .leftJoinAndSelect("block.category", "blockCategory")
        //     .where("dayPlan.date = :date", { date: dateOnly })
        //     .andWhere("dayPlan.userId = :userId", { userId: user.id })
        //     .orderBy("block.startMinute", "ASC")
        //     .getOne();

        // if (!todaysPlan) {
        //     return { insight: "No day plan found for today. Create a day plan to get personalized insights!" };
        // }