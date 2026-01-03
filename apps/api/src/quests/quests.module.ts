import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsRepository } from './quests.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestsRepository]),
    AuthModule
  ],
  controllers: [QuestsController],
  providers: [QuestsService]
})
export class QuestsModule { }
