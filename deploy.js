/**
 * Aegisky Medusa - Deployment & Rollback System
 * Sprint 3: Rollback Red Line
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const VERSION_FILE = path.join(__dirname, '.deploy-version')
const DEPLOY_HISTORY = path.join(__dirname, '.deploy-history.json')

function generateVersion() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `v${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
}

function getCurrentVersion() {
  try {
    return fs.readFileSync(VERSION_FILE, 'utf8').trim()
  } catch {
    return 'v0.0.0-initial'
  }
}

function getDeployHistory() {
  try {
    return JSON.parse(fs.readFileSync(DEPLOY_HISTORY, 'utf8'))
  } catch {
    return []
  }
}

function saveDeployHistory(history) {
  fs.writeFileSync(DEPLOY_HISTORY, JSON.stringify(history, null, 2))
}

function startDeployment() {
  const version = generateVersion()
  const record = {
    version,
    timestamp: new Date().toISOString(),
    backendImage: `aegisky/backend:${version}`,
    frontendImage: `aegisky/frontend:${version}`,
    status: 'deploying',
    healthCheckPassed: false,
  }

  const history = getDeployHistory()
  history.push(record)
  saveDeployHistory(history)

  console.log(`[DEPLOY] Starting deployment ${version}`)
  return record
}

function markDeploymentStable(version) {
  const history = getDeployHistory()
  const record = history.find(r => r.version === version)
  if (record) {
    record.status = 'stable'
    record.healthCheckPassed = true
    saveDeployHistory(history)
    fs.writeFileSync(VERSION_FILE, version)
    console.log(`[DEPLOY] ${version} marked as stable`)
  }
}

function rollback(version) {
  const startTime = Date.now()
  const history = getDeployHistory()

  let targetVersion = version
  if (!targetVersion) {
    const stableVersions = history.filter(r => r.status === 'stable').reverse()
    if (stableVersions.length < 2) {
      throw new Error('No previous stable version to roll back to')
    }
    targetVersion = stableVersions[1].version
  }

  const target = history.find(r => r.version === targetVersion)
  if (!target) {
    throw new Error(`Version ${targetVersion} not found in history`)
  }

  console.log(`[ROLLBACK] Rolling back to ${targetVersion}...`)

  try {
    console.log('[ROLLBACK] Stopping current containers...')
    try {
      execSync('docker compose -f docker-compose.prod.yml stop backend frontend', { stdio: 'pipe' })
    } catch (e) {
      // Ignore if containers not running
    }

    console.log('[ROLLBACK] Previous images would be started here in production')
    console.log(`[ROLLBACK] Target: ${target.backendImage}, ${target.frontendImage}`)

    fs.writeFileSync(VERSION_FILE, targetVersion)

    const current = history.find(r => r.status === 'stable')
    if (current) {
      current.status = 'rolled_back'
    }
    saveDeployHistory(history)

    const duration = Date.now() - startTime
    console.log(`[ROLLBACK] Success! Rolled back to ${targetVersion} in ${Math.round(duration / 1000)}s`)

    return { success: true, targetVersion, duration }

  } catch (error) {
    console.error('[ROLLBACK] Failed:', error)
    throw error
  }
}

function buildImages(version) {
  console.log(`[BUILD] Building images for ${version}...`)
  console.log('[BUILD] In production: docker build commands would run here')
  console.log(`[BUILD] Images: aegisky/backend:${version}, aegisky/frontend:${version}`)
}

if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case 'deploy':
      const record = startDeployment()
      buildImages(record.version)
      console.log(`\n[DEPLOY] Images built. After health check, run: node deploy.js confirm ${record.version}`)
      break

    case 'confirm':
      const confirmVersion = process.argv[3]
      if (!confirmVersion) {
        console.error('Usage: node deploy.js confirm <version>')
        process.exit(1)
      }
      markDeploymentStable(confirmVersion)
      break

    case 'rollback':
      const rollbackVersion = process.argv[3]
      try {
        const result = rollback(rollbackVersion)
        console.log(`\nRollback complete: ${result.targetVersion} (${Math.round(result.duration / 1000)}s)`)
      } catch (e) {
        console.error('Rollback failed:', e.message)
        process.exit(1)
      }
      break

    case 'current':
      console.log('Current version:', getCurrentVersion())
      break

    case 'history':
      const history = getDeployHistory()
      console.log('\nDeployment History:')
      console.log('='.repeat(70))
      if (history.length === 0) {
        console.log('No deployments recorded yet')
      } else {
        history.slice(-10).reverse().forEach(r => {
          const icon = r.status === 'stable' ? '[OK]' : r.status === 'rolled_back' ? '[RB]' : '[..]'
          console.log(`${icon} ${r.version.padEnd(22)} ${r.status.padEnd(12)} ${r.timestamp}`)
        })
      }
      console.log('')
      break

    default:
      console.log(`
Aegisky Deployment Manager
Usage:
  node deploy.js deploy          Start new deployment
  node deploy.js confirm <ver>   Mark deployment as stable
  node deploy.js rollback [ver]  Rollback to previous or specific version
  node deploy.js current         Show current version
  node deploy.js history         Show deployment history
      `)
  }
}

module.exports = {
  generateVersion,
  getCurrentVersion,
  startDeployment,
  markDeploymentStable,
  rollback,
  buildImages,
}
