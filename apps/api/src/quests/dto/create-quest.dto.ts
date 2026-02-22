import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    maxPoints: number;
    @IsOptional()
    @IsString()
    categoryId?: string;
}
