import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsRepository } from './quests.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestsRepository]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService]
})
export class QuestsModule { }
