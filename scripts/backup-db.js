/**
 * Aegisky Medusa - Database Backup Script
 * Sprint 4: Production readiness
 *
 * Creates daily PostgreSQL backups with compression
 * Usage: node backup-db.js
 *
 * Schedule with Windows Task Scheduler or cron:
 *   Daily at 2:00 AM
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  // Docker container
  container: 'aegisky-medusa-postgres',
  database: 'medusa-aegisky',
  username: 'medusa',
  host: 'localhost',
  port: 5434,

  // Backup settings
  backupDir: path.join(__dirname, 'backups'),
  retentionDays: 30,
  compress: true,
}

if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true })
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const filename = `aegisky-backup-${timestamp}.sql.gz`
const filepath = path.join(config.backupDir, filename)

console.log(`[Backup] Starting backup to ${filename}...`)
console.log(`[Backup] Time: ${new Date().toLocaleString()}`)

const dumpCommand = [
  'docker exec',
  config.container,
  'bash -c',
  `"pg_dump -U ${config.username} -d ${config.database} --no-owner --no-privileges --clean --if-exists | gzip"`,
].join(' ')

const fullCommand = `${dumpCommand} > "${filepath}"`

const startTime = Date.now()

exec(fullCommand, { maxBuffer: 1024 * 1024 * 500 }, (error, stdout, stderr) => {
  if (error) {
    console.error('[Backup] FAILED:', error.message)
    process.exit(1)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  const stats = fs.statSync(filepath)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

  console.log(`[Backup] SUCCESS: ${filename}`)
  console.log(`[Backup] Size: ${sizeMB} MB`)
  console.log(`[Backup] Duration: ${duration}s`)

  cleanupOldBackups()
  writeBackupLog({ filename, size: stats.size, duration: parseFloat(duration), timestamp: new Date().toISOString(), success: true })
})

function cleanupOldBackups() {
  console.log(`[Cleanup] Removing backups older than ${config.retentionDays} days...`)
  const files = fs.readdirSync(config.backupDir).filter(f => f.startsWith('aegisky-backup-'))
  const now = Date.now()
  let removed = 0

  for (const file of files) {
    const filePath = path.join(config.backupDir, file)
    const stat = fs.statSync(filePath)
    const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24)
    if (ageDays > config.retentionDays) {
      fs.unlinkSync(filePath)
      removed++
      console.log(`[Cleanup] Removed: ${file}`)
    }
  }
  console.log(`[Cleanup] Removed ${removed} old backup(s)`)
}

function writeBackupLog(entry) {
  const logFile = path.join(config.backupDir, 'backup-log.json')
  let logs = []
  if (fs.existsSync(logFile)) {
    try { logs = JSON.parse(fs.readFileSync(logFile, 'utf8')) } catch (e) { logs = [] }
  }
  logs.push(entry)
  if (logs.length > 100) logs = logs.slice(-100)
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2))
}
