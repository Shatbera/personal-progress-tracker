import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { DayPlan } from 'src/day-plans/day-plan.entity';
import { Repository } from 'typeorm';
import { DailyInsightResponseDto } from './dto/daily-insight-response.dto';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import { DailyInsightInputDto } from './dto/daily-insight-input.dto';

@Injectable()
export class AiService {
    constructor(
        @InjectRepository(DayPlan)
        private readonly dayPlansRepository: Repository<DayPlan>,
        private readonly configService: ConfigService,
    ) { }

    public async generateDailyInsight(user: User): Promise<DailyInsightResponseDto> {
        const key = this.configService.get<string>('OPENAI_API_KEY');

        if (!key) {
            throw new InternalServerErrorException('OPENAI_API_KEY is missing');
        }

        const todayPlan = await this.getTodaysPlan(user);

        const prompt = (await this.getDailyInsightInput(todayPlan)).prompt;

        try {
            const client = new OpenAI({
                apiKey: key,
            });

            const response = await client.responses.create({
                model: 'gpt-5.2',
                input: prompt,
            });

            if (response.output_text) {
                const insight = response.output_text.trim();
                if(todayPlan) {
                    await this.dayPlansRepository.update({ id: todayPlan.id }, { insight });   
                }
                return { insight };
            } else {
                return { insight: 'No insight generated.' };
            }
        } catch (error) {
            console.error('OpenAI error:', error);
            throw new InternalServerErrorException('Failed to generate AI insight');
        }
    }

    private async getTodaysPlan(user: User): Promise<DayPlan | null> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateOnly = `${year}-${month}-${day}`;

        const todaysPlan = await this.dayPlansRepository
            .createQueryBuilder('dayPlan')
            .leftJoinAndSelect('dayPlan.blocks', 'block')
            .leftJoinAndSelect('block.category', 'blockCategory')
            .where('dayPlan.date = :date', { date: dateOnly })
            .andWhere('dayPlan.userId = :userId', { userId: user.id })
            .orderBy('block.startMinute', 'ASC')
            .getOne();

        return todaysPlan || null;
    }


    private async getDailyInsightInput(todaysPlan: DayPlan | null): Promise<DailyInsightInputDto> {

        if (!todaysPlan) {
            return {
                prompt: `
                    You are a productivity coach inside a personal progress tracking app.

                    The user has no plan for today.
                    Write one very short response encouraging them to create a day plan first.
                    Keep it to 1-2 sentences.
                `.trim(),
            };
        }

        const prompt = this.buildDailyInsightPrompt(todaysPlan);

        return { prompt };
    }

    private buildDailyInsightPrompt(dayPlan: DayPlan): string {
        const reflection = dayPlan.reflection?.trim()
            ? dayPlan.reflection.trim()
            : 'No reflection provided.';

        const blocks = [...(dayPlan.blocks || [])].sort(
            (a, b) => a.startMinute - b.startMinute,
        );

        const blocksText =
            blocks.length > 0
                ? blocks
                    .map((block, index) => {
                        const start = this.formatMinute(block.startMinute);
                        const end = this.formatMinute(block.endMinute);

                        const parts: string[] = [
                            `${index + 1}. ${start}–${end}`,
                            `Label: ${block.label}`,
                        ];

                        if (block.category?.name) {
                            parts.push(`Category: ${block.category.name}`);
                        }

                        parts.push(`Completed: ${block.isCompleted ? 'yes' : 'no'}`);

                        return parts.join(' | ');
                    })
                    .join('\n')
                : 'No blocks planned.';

        const planDate =
            dayPlan.date instanceof Date
                ? dayPlan.date.toISOString().slice(0, 10)
                : String(dayPlan.date);

        return `
                You are a supportive and encouraging assistant inside a personal progress tracking app.

                Your task is to write one short, human-sounding insight about the user's day plan.

                Tone:
                - Warm
                - Encouraging
                - Natural
                - Never sound robotic, harsh, or overly formal

                Rules:
                - Write only 2-4 sentences
                - Be Objective and honest
                - If there is a weakness or risk, mention it gently
                - If it's too unproductive, don't hesitate to say that, but do it in a supportive way
                - Do not use bullet points
                - Sound like a thoughtful coach, not a machine
                - don't use — or other symbols in the insight

                Day plan date: ${planDate}
                Available day range: ${this.formatMinute(dayPlan.startMinute)}–${this.formatMinute(dayPlan.endMinute)}

                Reflection:
                ${reflection}

                Blocks:
                ${blocksText}

                Write one short encouraging insight about this day.
`.trim();
    }

    private formatMinute(minute: number): string {
        const hours = Math.floor(minute / 60);
        const minutes = minute % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
}