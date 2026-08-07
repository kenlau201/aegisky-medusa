/**
 * Sprint 3 Security Fix
 * Remove all error.message/details from API responses
 * Never expose internal errors to clients
 */
const fs = require('fs')
const path = require('path')

const apiDir = path.join(__dirname, '..', 'backend', 'src', 'api')

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Replace patterns that expose error.message
  // Pattern 1: { error: '...', message: error.message }
  content = content.replace(
    /(\w+)\.status\(500\)\.json\(\{\s*error:\s*['"][^'"]+['"],\s*message:\s*error\.message\s*\}\)/g,
    (match, resVar) => {
      modified = true
      return `${resVar}.status(500).json({ error: 'Internal server error' })`
    }
  )

  // Pattern 2: { error: '...', details: error.message }
  content = content.replace(
    /(\w+)\.status\(500\)\.json\(\{\s*error:\s*['"][^'"]+['"],\s*details:\s*error\.message\s*\}\)/g,
    (match, resVar) => {
      modified = true
      return `${resVar}.status(500).json({ error: 'Internal server error' })`
    }
  )

  // Pattern 3: Response.json with details
  content = content.replace(
    /Response\.json\(\s*\{\s*error:\s*['"][^'"]+['"],\s*details:\s*error\.message\s*\},\s*\{\s*status:\s*500\s*\}\s*\)/g,
    () => {
      modified = true
      return `Response.json({ error: 'Internal server error' }, { status: 500 })`
    }
  )

  // Pattern 4: Response.json with message
  content = content.replace(
    /Response\.json\(\s*\{\s*error:\s*['"][^'"]+['"],\s*message:\s*error\.message\s*\},\s*\{\s*status:\s*500\s*\}\s*\)/g,
    () => {
      modified = true
      return `Response.json({ error: 'Internal server error' }, { status: 500 })`
    }
  )

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log('Fixed:', path.relative(apiDir, filePath))
  }
  return modified
}

// Walk all API route files
function walkDir(dir) {
  const files = fs.readdirSync(dir)
  let count = 0
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      // Skip admin-temp backup directory
      if (file === 'admin-temp') continue
      count += walkDir(fullPath)
    } else if (file === 'route.js') {
      if (fixFile(fullPath)) count++
    }
  }
  return count
}

console.log('Scanning API routes for security issues...')
const fixed = walkDir(apiDir)
console.log(`\nFixed ${fixed} files. Security red line enforced.`)
