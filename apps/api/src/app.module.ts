import { Module } from '@nestjs/common';
import { QuestsModule } from './quests/quests.module';

@Module({
  imports: [QuestsModule],
})
export class AppModule {}
