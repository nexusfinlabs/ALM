const CLIENT_ID = process.env.APS_CLIENT_ID
const CLIENT_SECRET = process.env.APS_CLIENT_SECRET
const BUCKET_KEY = process.env.APS_BUCKET_KEY || 'struxai-models'

async function getToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=data%3Aread%20bucket%3Aread',
  })
  const d = await res.json()
  return d.access_token
}

async function checkStatus(token, urn) {
  const res = await fetch(
    `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (res.status === 404) return 'not_translated'
  const d = await res.json()
  return d.status || 'unknown'
}

async function main() {
  const token = await getToken()

  const res = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!data.items) {
    console.log('No items or error:', data)
    return
  }

  console.log(`\n=== Files in bucket "${BUCKET_KEY}" ===\n`)
  for (const item of data.items) {
    const urn = Buffer.from(item.objectId).toString('base64').replace(/=/g, '')
    const status = await checkStatus(token, urn)
    const sizeKb = (item.size / 1024).toFixed(0)
    console.log(`File:   ${item.objectKey}  (${sizeKb} KB)`)
    console.log(`Status: ${status}`)
    console.log(`URN:    ${urn}`)
    console.log('-'.repeat(70))
  }
}

main().catch(e => console.error('ERROR:', e.message))
