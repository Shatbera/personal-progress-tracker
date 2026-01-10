import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { QuestEventType } from '../quest-event-type.enum';

export class LogEventDto {
    @IsUUID()
    @IsNotEmpty()
    questId: string;

    @IsEnum(QuestEventType)
    @IsNotEmpty()
    eventType: QuestEventType;

    @IsNumber()
    pointsChanged: number;
}