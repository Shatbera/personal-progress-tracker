import { QuestStatus } from "../quest-status.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class GetQuestsFilterDto {
    @IsOptional()
    @IsEnum(QuestStatus)
    status?: QuestStatus;
    @IsOptional()
    @IsString()
    search?: string;
}