import { IsNotEmpty } from 'class-validator';

export class CreateQuestDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    maxPoints: number;
}
