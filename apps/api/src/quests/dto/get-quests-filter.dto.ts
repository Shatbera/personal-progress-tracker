import { QuestStatus } from "../quest.model";

export class GetQuestsFilterDto {
    status?: QuestStatus;
    search?: string;
}