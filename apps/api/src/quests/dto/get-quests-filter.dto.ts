import { IsEnum, IsOptional, IsString } from "class-validator";

export class GetQuestsFilterDto {
    @IsOptional()
    @IsString()
    search?: string;
}