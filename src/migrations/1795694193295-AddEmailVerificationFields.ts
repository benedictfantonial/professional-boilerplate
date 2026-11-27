import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerificationFields1795694193295 implements MigrationInterface {
    name = 'AddEmailVerificationFields1795694193295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE INDEX `emails` ON `users` (`email`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`emails\` ON \`users\``);
    }

}
