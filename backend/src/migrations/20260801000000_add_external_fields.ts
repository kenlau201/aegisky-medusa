import { MigrationInterface, QueryRunner } from "typeorm"

export class AddExternalFields1690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 产品表增加追溯字段
    await queryRunner.query(`
      ALTER TABLE "product" 
      ADD COLUMN IF NOT EXISTS "external_id" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "source_url" TEXT,
      ADD COLUMN IF NOT EXISTS "original_name_ru" TEXT,
      ADD COLUMN IF NOT EXISTS "original_price_rub" DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "data_hash" VARCHAR(64),
      ADD COLUMN IF NOT EXISTS "imported_at" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "sync_status" VARCHAR(50) DEFAULT 'pending'
    `)
    
    // external_id唯一索引，保证幂等
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_external_id" ON "product" ("external_id")
    `)

    // 分类表增加追溯字段
    await queryRunner.query(`
      ALTER TABLE "product_category"
      ADD COLUMN IF NOT EXISTS "external_id" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "original_name_ru" TEXT,
      ADD COLUMN IF NOT EXISTS "source_category_id" INTEGER
    `)
    
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_category_external_id" ON "product_category" ("external_id")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_external_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_category_external_id"`)
    await queryRunner.query(`
      ALTER TABLE "product" 
      DROP COLUMN IF EXISTS "external_id",
      DROP COLUMN IF EXISTS "source_url",
      DROP COLUMN IF EXISTS "original_name_ru",
      DROP COLUMN IF EXISTS "original_price_rub",
      DROP COLUMN IF EXISTS "data_hash",
      DROP COLUMN IF EXISTS "imported_at",
      DROP COLUMN IF EXISTS "last_synced_at",
      DROP COLUMN IF EXISTS "sync_status"
    `)
    await queryRunner.query(`
      ALTER TABLE "product_category"
      DROP COLUMN IF EXISTS "external_id",
      DROP COLUMN IF EXISTS "original_name_ru",
      DROP COLUMN IF EXISTS "source_category_id"
    `)
  }
}
