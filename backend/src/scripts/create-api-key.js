const { Client } = require('pg')
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })
const crypto = require('crypto')

async function createKey() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  // Check if there's already a publishable key
  const existing = await client.query("SELECT * FROM api_key WHERE type = 'publishable' AND revoked_at IS NULL")
  if (existing.rows.length > 0) {
    console.log('Existing publishable key:', existing.rows[0].token)
    await client.end()
    return existing.rows[0].token
  }

  // Create a new publishable key
  const token = 'pk_' + crypto.randomBytes(24).toString('hex')
  const id = crypto.randomUUID()

  await client.query(
    `INSERT INTO api_key (id, token, type, title, created_by, created_at, updated_at, revoked_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NULL)`,
    [id, token, 'publishable', 'Storefront Publishable Key', null]
  )

  console.log('Created publishable key:', token)
  await client.end()
  return token
}

createKey().catch(console.error)
