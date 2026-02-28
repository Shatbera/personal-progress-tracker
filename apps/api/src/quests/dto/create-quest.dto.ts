import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { CreateDailyTrackDetailsDto } from 'src/daily-track/dto/create-daily-track-details.dto';
import { QuestType } from '../quest-type.enum';

export class CreateQuestDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    maxPoints: number;
    @IsOptional()
    @IsString()
    categoryId?: string;
    @IsEnum(QuestType)
    questType: QuestType;
    @ValidateIf((o) => o.questType === QuestType.DAILY_TRACK)
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreateDailyTrackDetailsDto)
    details?: CreateDailyTrackDetailsDto;
}
