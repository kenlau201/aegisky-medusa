/**
 * Aegisky Medusa - Basic Load Test
 * Sprint 4: 50 concurrent, P95 < 2s target
 *
 * Usage: node load-test.js
 */

const http = require('http')
const https = require('https')

const BASE_URL = 'http://localhost:9000'
const KEY = 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

const endpoints = [
  { name: 'Products List', path: '/store/products?limit=24', method: 'GET' },
  { name: 'Categories', path: '/store/categories', method: 'GET' },
  { name: 'Brands', path: '/store/brands', method: 'GET' },
  { name: 'Health', path: '/store/health', method: 'GET' },
  { name: 'Search', path: '/store/search?q=dji&limit=12', method: 'GET' },
]

const CONCURRENCY = 50
const DURATION_SEC = 15

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const start = Date.now()
    const url = new URL(BASE_URL + endpoint.path)

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'x-publishable-api-key': KEY,
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        resolve({
          duration: Date.now() - start,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
        })
      })
    })

    req.on('error', () => {
      resolve({ duration: Date.now() - start, status: 0, success: false })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      resolve({ duration: 10000, status: 0, success: false })
    })

    req.end()
  })
}

async function runLoadTest() {
  console.log('='.repeat(60))
  console.log('  Aegisky Medusa - Load Test')
  console.log(`  Concurrency: ${CONCURRENCY}, Duration: ${DURATION_SEC}s`)
  console.log('='.repeat(60))
  console.log()

  const results = {}

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `)

    const durations = []
    let success = 0
    let failed = 0
    let totalRequests = 0

    const startTime = Date.now()
    const workers = []

    for (let i = 0; i < CONCURRENCY; i++) {
      workers.push((async () => {
        while (Date.now() - startTime < DURATION_SEC * 1000) {
          const result = await makeRequest(endpoint)
          durations.push(result.duration)
          totalRequests++
          if (result.success) success++
          else failed++
        }
      })())
    }

    await Promise.all(workers)

    durations.sort((a, b) => a - b)
    const p50 = durations[Math.floor(durations.length * 0.5)]
    const p95 = durations[Math.floor(durations.length * 0.95)]
    const p99 = durations[Math.floor(durations.length * 0.99)]
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const rps = Math.round(totalRequests / DURATION_SEC)

    results[endpoint.name] = { p50, p95, p99, avg, rps, success, failed, total: totalRequests }

    const p95Status = p95 < 2000 ? '✅ PASS' : '❌ FAIL'
    console.log(`${totalRequests} req, ${rps}/s, P50=${p50}ms, P95=${p95}ms, P99=${p99}ms ${p95Status}`)
  }

  console.log()
  console.log('='.repeat(60))
  console.log('  Summary')
  console.log('='.repeat(60))

  let allPass = true
  for (const [name, r] of Object.entries(results)) {
    const status = r.p95 < 2000 ? '✅' : '❌'
    if (r.p95 >= 2000) allPass = false
    console.log(`${status} ${name.padEnd(20)} P95=${String(r.p95).padStart(5)}ms  ${r.rps} req/s  errors=${r.failed}`)
  }

  console.log()
  console.log(allPass
    ? '✅ ALL ENDPOINTS PASS P95 < 2000ms TARGET'
    : '⚠️  SOME ENDPOINTS EXCEED P95 TARGET')
}

runLoadTest().catch(console.error)
