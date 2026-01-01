import { Module } from '@nestjs/common';
import { QuestsModule } from './quests/quests.module';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    QuestsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'quests_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule { }
