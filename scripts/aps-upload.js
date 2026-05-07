const fs = require('fs')
const path = require('path')
const CLIENT_ID = process.env.APS_CLIENT_ID
const CLIENT_SECRET = process.env.APS_CLIENT_SECRET
const BUCKET_KEY = process.env.APS_BUCKET_KEY || 'struxai-models'
const filePath = process.argv[2]
if (!filePath) { console.error('Usage: node aps-upload.js <file>'); process.exit(1) }
const fileName = path.basename(filePath)
const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')

async function getToken() {
  const creds = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
  const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + creds },
    body: 'grant_type=client_credentials&scope=data%3Aread%20data%3Awrite%20data%3Acreate%20bucket%3Acreate%20bucket%3Aread',
  })
  const d = await res.json()
  if (!d.access_token) throw new Error('Token: ' + JSON.stringify(d))
  console.log('OK Token'); return d.access_token
}

async function ensureBucket(t) {
  const r = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/details', { headers: { Authorization: 'Bearer ' + t } })
  if (r.status === 200) { console.log('OK Bucket exists'); return }
  await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucketKey: BUCKET_KEY, policyKey: 'persistent' }),
  })
  console.log('OK Bucket created')
}

async function upload(t) {
  const data = fs.readFileSync(filePath)
  const objectKey = encodeURIComponent(safeName)
  const sign = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/objects/' + objectKey + '/signeds3upload?minutesExpiration=60&parts=1', { headers: { Authorization: 'Bearer ' + t } })
  const sd = await sign.json()
  if (!sd.urls) throw new Error('Sign: ' + JSON.stringify(sd))
  console.log('OK Signed URL')
  const put = await fetch(sd.urls[0], { method: 'PUT', body: data })
  if (!put.ok) throw new Error('PUT failed: ' + put.status)
  console.log('OK Uploaded ' + (data.length / 1024).toFixed(0) + ' KB')
  const fin = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/objects/' + objectKey + '/signeds3upload', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadKey: sd.uploadKey }),
  })
  const fd = await fin.json()
  if (!fd.objectId) throw new Error('Finalize: ' + JSON.stringify(fd))
  console.log('OK Finalized'); return fd.objectId
}

async function translate(t, oid) {
  const urn = Buffer.from(oid).toString('base64').replace(/=/g, '')
  const r = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json', 'x-ads-force': 'true' },
    body: JSON.stringify({ input: { urn }, output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] } }),
  })
  if (r.status !== 200 && r.status !== 201) throw new Error('Translate: ' + JSON.stringify(await r.json()))
  console.log('OK Translation started'); return urn
}

async function poll(t, urn) {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const r = await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest', { headers: { Authorization: 'Bearer ' + t } })
    const d = await r.json()
    process.stdout.write('\r  ' + d.status + ' ' + (d.progress || '') + '            ')
    if (d.status === 'success') { console.log('\nOK Done'); return true }
    if (d.status === 'failed') { console.error('\nFAILED'); return false }
  }
  return false
}

async function main() {
  console.log('File: ' + fileName + '\n')
  const t = await getToken()
  await ensureBucket(t)
  const oid = await upload(t)
  const urn = await translate(t, oid)
  if (await poll(t, urn)) console.log('\n' + '='.repeat(60) + '\nURN:\n' + urn + '\n' + '='.repeat(60))
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
