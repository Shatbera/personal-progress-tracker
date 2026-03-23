import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1774278598543 implements MigrationInterface {
    name = 'InitialSchema1774278598543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quest_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventType" character varying NOT NULL, "pointsChanged" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "questId" uuid, "userId" uuid, CONSTRAINT "PK_13a898f86b13a8be9913264303a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."quest_questtype_enum" AS ENUM('LONG_TERM_GOAL', 'WEEKLY_GOAL', 'DAILY_TRACK')`);
        await queryRunner.query(`CREATE TABLE "quest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "maxPoints" integer NOT NULL, "questType" "public"."quest_questtype_enum" NOT NULL DEFAULT 'LONG_TERM_GOAL', "createdAt" TIMESTAMP NOT NULL, "completedAt" TIMESTAMP, "archivedAt" TIMESTAMP, "userId" uuid, "categoryId" uuid, CONSTRAINT "PK_0d6873502a58302d2ae0b82631c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quest_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL DEFAULT '#6c757d', "isBuiltIn" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_bf942495edb7fdb4e04bcaead2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "day_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startMinute" integer NOT NULL, "endMinute" integer NOT NULL, "dayPlanId" uuid NOT NULL, "label" character varying NOT NULL, "categoryId" uuid, "isCompleted" boolean NOT NULL DEFAULT false, "questId" uuid, "questLogId" uuid, CONSTRAINT "PK_abe32f2722f8ebe6f0f3f99cdbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "day_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "startMinute" integer NOT NULL, "endMinute" integer NOT NULL, "reflection" text NOT NULL DEFAULT '', "insight" text NOT NULL DEFAULT '', "mood" integer, "userId" uuid, CONSTRAINT "PK_26197fc1c4c9be940a59cc13986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_track_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dailyTrackId" uuid NOT NULL, "day" integer NOT NULL, "date" date NOT NULL, "progressQuestEventId" uuid, "note" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_9ced0b32c1617fb07d71b50bf67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "questId" uuid NOT NULL, "startDate" date NOT NULL, "durationDays" integer NOT NULL, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_248a872425d5f5366d845fec9e2" UNIQUE ("questId"), CONSTRAINT "REL_248a872425d5f5366d845fec9e" UNIQUE ("questId"), CONSTRAINT "PK_d3cc0e9d65be28dd98d387a5132" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quest_event" ADD CONSTRAINT "FK_f99e4a15711d77ca024269f64e8" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quest_event" ADD CONSTRAINT "FK_766032038e6f2b45e0bfc2cfb84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quest" ADD CONSTRAINT "FK_5d02a590f660db13e4f8488d087" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quest" ADD CONSTRAINT "FK_c374170139446049a95e89db9b5" FOREIGN KEY ("categoryId") REFERENCES "quest_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quest_category" ADD CONSTRAINT "FK_cf0082bef4ce564a6cb1d47dde8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "day_block" ADD CONSTRAINT "FK_7e59d92fefeb6e67777aa00330a" FOREIGN KEY ("dayPlanId") REFERENCES "day_plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "day_block" ADD CONSTRAINT "FK_e66993f12047b7a072d4098b5c5" FOREIGN KEY ("categoryId") REFERENCES "quest_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "day_block" ADD CONSTRAINT "FK_eb3abda6b496762de0700e1758e" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "day_block" ADD CONSTRAINT "FK_7fb082ae293583548c59190107e" FOREIGN KEY ("questLogId") REFERENCES "quest_event"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "day_plan" ADD CONSTRAINT "FK_f3a562c5225b373b57c950770a8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_track_entry" ADD CONSTRAINT "FK_a256df179b9bfb34dbba549538f" FOREIGN KEY ("dailyTrackId") REFERENCES "daily_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_track_entry" ADD CONSTRAINT "FK_13736fac6a5456cf880a8e905f6" FOREIGN KEY ("progressQuestEventId") REFERENCES "quest_event"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_track" ADD CONSTRAINT "FK_248a872425d5f5366d845fec9e2" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_track" DROP CONSTRAINT "FK_248a872425d5f5366d845fec9e2"`);
        await queryRunner.query(`ALTER TABLE "daily_track_entry" DROP CONSTRAINT "FK_13736fac6a5456cf880a8e905f6"`);
        await queryRunner.query(`ALTER TABLE "daily_track_entry" DROP CONSTRAINT "FK_a256df179b9bfb34dbba549538f"`);
        await queryRunner.query(`ALTER TABLE "day_plan" DROP CONSTRAINT "FK_f3a562c5225b373b57c950770a8"`);
        await queryRunner.query(`ALTER TABLE "day_block" DROP CONSTRAINT "FK_7fb082ae293583548c59190107e"`);
        await queryRunner.query(`ALTER TABLE "day_block" DROP CONSTRAINT "FK_eb3abda6b496762de0700e1758e"`);
        await queryRunner.query(`ALTER TABLE "day_block" DROP CONSTRAINT "FK_e66993f12047b7a072d4098b5c5"`);
        await queryRunner.query(`ALTER TABLE "day_block" DROP CONSTRAINT "FK_7e59d92fefeb6e67777aa00330a"`);
        await queryRunner.query(`ALTER TABLE "quest_category" DROP CONSTRAINT "FK_cf0082bef4ce564a6cb1d47dde8"`);
        await queryRunner.query(`ALTER TABLE "quest" DROP CONSTRAINT "FK_c374170139446049a95e89db9b5"`);
        await queryRunner.query(`ALTER TABLE "quest" DROP CONSTRAINT "FK_5d02a590f660db13e4f8488d087"`);
        await queryRunner.query(`ALTER TABLE "quest_event" DROP CONSTRAINT "FK_766032038e6f2b45e0bfc2cfb84"`);
        await queryRunner.query(`ALTER TABLE "quest_event" DROP CONSTRAINT "FK_f99e4a15711d77ca024269f64e8"`);
        await queryRunner.query(`DROP TABLE "daily_track"`);
        await queryRunner.query(`DROP TABLE "daily_track_entry"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "day_plan"`);
        await queryRunner.query(`DROP TABLE "day_block"`);
        await queryRunner.query(`DROP TABLE "quest_category"`);
        await queryRunner.query(`DROP TABLE "quest"`);
        await queryRunner.query(`DROP TYPE "public"."quest_questtype_enum"`);
        await queryRunner.query(`DROP TABLE "quest_event"`);
    }

}
