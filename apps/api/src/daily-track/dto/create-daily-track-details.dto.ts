import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateDailyTrackDetailsDto {
    @IsDateString()
    startDate: string;

    @IsInt()
    @Min(1)
    durationDays: number;
}
