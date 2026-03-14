import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { AiService } from './ai.service';
import { DailyInsightResponseDto } from './dto/daily-insight-response.dto';

@Controller('ai')
@UseGuards(AuthGuard())
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Get('daily-insight')
    async getDailyInsight(@GetUser() user: User) : Promise<DailyInsightResponseDto> {
        return this.aiService.generateDailyInsight(user);
    }
}
