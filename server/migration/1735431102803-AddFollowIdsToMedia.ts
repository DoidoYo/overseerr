import { MigrationInterface, QueryRunner } from "typeorm"

export class AddFollowIdsToMedia1735431102803 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `ALTER TABLE "media" ADD COLUMN "followIds" text DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "season" ADD COLUMN "totalEpisodesNumber" integer DEFAULT 0`
    );
    await queryRunner.query(
        `ALTER TABLE "season" ADD COLUMN "episodesNumber" integer DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `ALTER TABLE "media" DROP COLUMN "followIds"`
    );
    await queryRunner.query(
      `ALTER TABLE "season" DROP COLUMN "totalEpisodesNumber"`
    );
    await queryRunner.query(
        `ALTER TABLE "season" DROP COLUMN "episodesNumber"`
    );
  }

}
