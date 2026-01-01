import { QuestStatus } from "../quest-status.enum";
import { IsEnum } from "class-validator";

export class UpdateQuestStatusDto {
    @IsEnum(QuestStatus)
    status: QuestStatus;
}