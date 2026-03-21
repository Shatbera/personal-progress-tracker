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
    ) {}

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
                model: 'gpt-5.4',
                input: prompt,
            });

            if (response.output_text) {
                const insight = response.output_text
                    .replace(/\s+/g, ' ')
                    .trim();

                if (todayPlan) {
                    await this.dayPlansRepository.update(
                        { id: todayPlan.id },
                        { insight },
                    );
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
You are a sharp but supportive coach inside a personal progress tracking app.

The user has no plan for today.
Write 1 or 2 short sentences that push them to create structure for the day.
Sound human, clear, and motivating.
Do not sound cheesy, robotic, or generic.
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
                          const duration = block.endMinute - block.startMinute;

                          const parts: string[] = [
                              `${index + 1}. ${start}-${end}`,
                              `Duration: ${duration} min`,
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

        const MOOD_LABELS: Record<number, string> = {
            0: 'Bad',
            1: 'Low',
            2: 'Okay',
            3: 'Good',
            4: 'Great',
        };

        const mood =
            dayPlan.mood !== null
                ? `Mood: ${MOOD_LABELS[dayPlan.mood] ?? 'Unknown'}`
                : 'No mood set.';

        return `
You are a sharp but supportive performance coach inside a personal progress tracking app.

Your job is to notice what actually stands out in the structure of the day and say something useful.
Write like a perceptive human coach reviewing the day of an ambitious person.
Be warm, but direct.
Have a point of view.

Focus on things like:
- where the highest-energy hours are being used
- whether creation is protected or buried
- whether the day has too much switching
- whether recovery is present
- whether the sequence of blocks makes sense
- whether the day feels intentional, weak, overloaded, balanced, or well-designed

Rules:
- Write 3 to 4 sentences
- 70 to 110 words total
- No bullet points
- No emojis
- No quotation marks
- No dashes like — or --
- Sound thoughtful, specific, and human
- Do not sound like therapy
- Do not sound like corporate feedback
- Do not summarize every block
- Pick the 1 or 2 most important observations only
- If something is weak, say it clearly but constructively
- If something is strong, explain why it is strong
- Do not force criticism if the structure is good
- Do not treat workout, health, or recovery as wasted time
- Only criticize those blocks if they clearly damage the structure of the day
- Prefer concrete judgments over vague praise
- Prefer the most meaningful observation over the most obvious criticism
- Prefer giving one clear adjustment over multiple vague suggestions
- The final sentence must include one concrete, actionable adjustment to the day
- Avoid vague advice like "worth reconsidering", "could be improved", or "something to think about"

Avoid generic phrases like:
- good balance
- thoughtful day
- real momentum
- strong mix
- nice structure
- productive day
- well-rounded plan
- disciplined but
- overall this is
- the best choice here

Preferred structure:
- Sentence 1: identify the strongest structural quality
- Sentence 2: identify the main tension or inefficiency
- Sentence 3 or 4: give one concrete adjustment to improve the day

Here is a GOOD example of the kind of insight you should sound like:

This is a very solid structure because the day already has clear shape instead of feeling improvised. The strongest part is that learning, creation, training, and work each have a defined place, which reduces mental friction and makes the day feel intentional. The only real tension is whether creation should come before learning if your sharpest hours are limited, but that is a refinement issue, not a flaw. Move creation before learning if output is the real priority, or keep the current order if the goal is simply a balanced disciplined day.

Here is a BAD example of the kind of insight you should avoid:

This plan has a strong mix of learning, creative work, health, and focused work time, which gives your day good balance. The main risk is the two hour workout in the middle, since it could drain energy for the long work block afterward. Overall, it looks like a thoughtful day with real momentum behind it.

Match the depth, tone, and specificity of the GOOD example.
Do not copy its wording.
Do not use the BAD style.

User context:
This user is ambitious and values discipline, growth, and intentional structure.
The insight should feel like it was written for someone serious about building a strong life, not for a casual to-do list app user.

Day plan date: ${planDate}
Available day range: ${this.formatMinute(dayPlan.startMinute)}-${this.formatMinute(dayPlan.endMinute)}

Reflection:
${reflection}

${mood}

Blocks:
${blocksText}

Now write one insight.
`.trim();
    }

    private formatMinute(minute: number): string {
        const hours = Math.floor(minute / 60);
        const minutes = minute % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
}