import { MigrationInterface, QueryRunner } from "typeorm"

export class AddFollowIdsToMedia1735431102803 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `ALTER TABLE "media" ADD COLUMN "followIds" text DEFAULT '[]'`
    );
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `ALTER TABLE "media" DROP COLUMN "followIds"`
    );
}

}
