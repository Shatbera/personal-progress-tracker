import { Module } from '@nestjs/common';
import { DailyTrackService } from './daily-track.service';
import { DailyTrackController } from './daily-track.controller';

@Module({
  providers: [DailyTrackService],
  controllers: [DailyTrackController]
})
export class DailyTrackModule {}
