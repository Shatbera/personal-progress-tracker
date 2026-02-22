import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestCategoriesService } from './quest-categories.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { QuestCategory } from './quest-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('quest-categories')
@UseGuards(AuthGuard())
export class QuestCategoriesController {
    constructor(private questCategoriesService: QuestCategoriesService) {}

    @Get()
    public getAllCategories(@GetUser() user: User): Promise<QuestCategory[]> {
        return this.questCategoriesService.getAllCategories(user);
    }

    @Post()
    public createCategory(
        @Body() dto: CreateCategoryDto,
        @GetUser() user: User,
    ): Promise<QuestCategory> {
        return this.questCategoriesService.createCategory(dto, user);
    }

    @Patch('/:id')
    public updateCategory(
        @Param('id') id: string,
        @Body() dto: CreateCategoryDto,
        @GetUser() user: User,
    ): Promise<QuestCategory> {
        return this.questCategoriesService.updateCategory(id, dto, user);
    }

    @Delete('/:id')
    public deleteCategory(
        @Param('id') id: string,
        @GetUser() user: User,
    ): Promise<void> {
        return this.questCategoriesService.deleteCategory(id, user);
    }
}
