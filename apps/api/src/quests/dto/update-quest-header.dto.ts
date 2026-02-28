import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateQuestHeaderDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    categoryId?: string | null;
}
