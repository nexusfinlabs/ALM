const fs = require('fs')
const path = require('path')

const CLIENT_ID = process.env.APS_CLIENT_ID
const CLIENT_SECRET = process.env.APS_CLIENT_SECRET
const BUCKET_KEY = process.env.APS_BUCKET_KEY || 'struxai-models'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: Set APS_CLIENT_ID and APS_CLIENT_SECRET env vars')
  process.exit(1)
}

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node aps-upload.js <path-to-cad-file>')
  process.exit(1)
}

const fileName = path.basename(filePath)

async function getToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=data%3Aread%20data%3Awrite%20data%3Acreate%20bucket%3Acreate%20bucket%3Aread',
  })
  const d = await res.json()
  if (!d.access_token) throw new Error('Token failed: ' + JSON.stringify(d))
  console.log('✓ Token OK')
  return d.access_token
}

async function ensureBucket(token) {
  const check = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/details`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (check.status === 200) {
    console.log(`✓ Bucket "${BUCKET_KEY}" exists`)
    return
  }
  const create = await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucketKey: BUCKET_KEY, policyKey: 'persistent' }),
  })
  const d = await create.json()
  if (create.status !== 200) throw new Error('Bucket create failed: ' + JSON.stringify(d))
  console.log(`✓ Bucket "${BUCKET_KEY}" created`)
}

async function uploadFile(token) {
  const fileData = fs.readFileSync(filePath)
  const objectKey = encodeURIComponent(fileName)
  const res = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${objectKey}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileData.length,
      },
      body: fileData,
    }
  )
  const d = await res.json()
  if (res.status !== 200) throw new Error('Upload failed: ' + JSON.stringify(d))
  console.log(`✓ Uploaded "${fileName}" (${(fileData.length / 1024).toFixed(0)} KB)`)
  return d.objectId
}

async function translate(token, objectId) {
  const urn = Buffer.from(objectId).toString('base64').replace(/=/g, '')
  const res = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ads-force': 'true',
    },
    body: JSON.stringify({
      input: { urn },
      output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] },
    }),
  })
  const d = await res.json()
  if (res.status !== 200 && res.status !== 201) throw new Error('Translation failed: ' + JSON.stringify(d))
  console.log('✓ Translation job started')
  return urn
}

async function pollStatus(token, urn) {
  console.log('⏳ Waiting for translation...')
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const res = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d = await res.json()
    const status = d.status
    const progress = d.progress || ''
    process.stdout.write(`\r  Status: ${status} ${progress}          `)
    if (status === 'success') {
      console.log('\n✓ Translation complete!')
      return true
    }
    if (status === 'failed') {
      console.error('\n✗ Translation failed:', JSON.stringify(d.derivatives))
      return false
    }
  }
  console.log('\n⚠ Timeout — check manually in APS dashboard')
  return false
}

async function main() {
  console.log(`\nNexusALM — APS Upload & Translate`)
  console.log(`File: ${fileName}\n`)
  const token = await getToken()
  await ensureBucket(token)
  const objectId = await uploadFile(token)
  const urn = await translate(token, objectId)
  const ok = await pollStatus(token, urn)
  if (ok) {
    console.log('\n' + '='.repeat(50))
    console.log('URN (paste this into the NexusALM viewer):')
    console.log(urn)
    console.log('='.repeat(50) + '\n')
  }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
