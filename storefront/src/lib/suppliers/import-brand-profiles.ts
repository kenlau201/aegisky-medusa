/**
 * Import brand profiles from JSON into PostgreSQL
 */
import fs from 'fs';
import path from 'path';
import { pool } from '@/lib/control-tower/db';

const projectRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';
const jsonPath = path.join(projectRoot, 'data', 'profiles', 'brand-profiles.json');

async function importProfiles() {
  const rawContent = fs.readFileSync(jsonPath, 'utf-8');
  const profiles = JSON.parse(rawContent);

  console.log(`Importing ${profiles.length} brand profiles...`);

  let successCount = 0;
  let errorCount = 0;

  for (const profile of profiles) {
    try {
      await pool.query(`
        UPDATE aegisky_brands
        SET
          address = $1,
          city = $2,
          email = $3,
          phone = $4,
          long_description = $5,
          product_lines = $6::jsonb,
          social_links = $7::jsonb,
          locations = $8::jsonb,
          certifications = $9::text[],
          employees = $10,
          country_code = $11,
          data_source = $12,
          verified = $13,
          tagline = $14,
          description = $15
        WHERE id = $16
      `, [
        profile.address || null,
        profile.city || null,
        profile.email || null,
        profile.phone || null,
        profile.long_description || null,
        JSON.stringify(profile.product_lines || []),
        JSON.stringify(profile.social_links || {}),
        JSON.stringify(profile.locations || []),
        profile.certifications || [],
        profile.employees || null,
        profile.country_code || null,
        profile.data_source || null,
        profile.verified || false,
        profile.tagline || null,
        profile.description || null,
        profile.id
      ]);
      successCount++;
    } catch (err: any) {
      console.error(`Error updating brand ${profile.id} (${profile.name}):`, err.message);
      errorCount++;
    }
  }

  console.log(`\nImport complete:`);
  console.log(`- Success: ${successCount}`);
  console.log(`- Errors: ${errorCount}`);

  await pool.end();
}

importProfiles().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
