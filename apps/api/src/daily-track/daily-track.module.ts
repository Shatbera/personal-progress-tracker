import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { DailyTrackService } from './daily-track.service';
import { DailyTrackController } from './daily-track.controller';
import { DailyTrackRepository } from './daily-track.repository';
import { DailyTrack } from './daily-track.entity';
import { DailyTrackEntry } from './daily-track-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyTrack, DailyTrackEntry]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [DailyTrackService, DailyTrackRepository],
  controllers: [DailyTrackController],
  exports: [DailyTrackService],
})
export class DailyTrackModule {}
