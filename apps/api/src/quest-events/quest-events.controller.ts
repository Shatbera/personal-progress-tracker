import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { QuestEventsService } from "./quest-events.service";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "src/auth/user.entity";
import { QuestEvent } from "./quest-event.entity";

@Controller("quests/:questId/events")
@UseGuards(AuthGuard())
export class QuestEventsController {
    constructor(private readonly questEventsService: QuestEventsService) { }

    @Post("progress")
    public logProgress(
        @Param("questId") questId: string,
        @GetUser() user: User
    ): Promise<QuestEvent> {
        return this.questEventsService.logProgress(questId, user);
    }

    @Post("undo")
    public undo(
        @Param("questId") questId: string,
        @GetUser() user: User
    ): Promise<QuestEvent> {
        return this.questEventsService.undo(questId, user);
    }

    @Post("reset")
    public reset(
        @Param("questId") questId: string,
        @GetUser() user: User
    ): Promise<QuestEvent> {
        return this.questEventsService.reset(questId, user);
    }

    @Get()
    public getQuestEvents(
        @Param("questId") questId: string,
        @GetUser() user: User
    ): Promise<QuestEvent[]> {
        return this.questEventsService.getQuestEvents(questId, user,);
    }
}
