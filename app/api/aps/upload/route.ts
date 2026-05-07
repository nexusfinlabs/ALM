import { NextRequest, NextResponse } from 'next/server'
const CLIENT_ID = process.env.APS_CLIENT_ID!
const CLIENT_SECRET = process.env.APS_CLIENT_SECRET!
const BUCKET_KEY = process.env.APS_BUCKET_KEY || 'struxai-models'

async function getToken() {
  const creds = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
  const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + creds },
    body: 'grant_type=client_credentials&scope=data%3Aread%20data%3Awrite%20data%3Acreate%20bucket%3Acreate%20bucket%3Aread%20viewables%3Aread',
  })
  return (await res.json()).access_token as string
}

async function ensureBucket(t: string) {
  const c = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/details', { headers: { Authorization: 'Bearer ' + t } })
  if (c.status === 200) return
  await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucketKey: BUCKET_KEY, policyKey: 'persistent' }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const file = fd.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const token = await getToken()
    await ensureBucket(token)
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const objectKey = encodeURIComponent(safe)
    const buf = Buffer.from(await file.arrayBuffer())
    const sign = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/objects/' + objectKey + '/signeds3upload?minutesExpiration=60&parts=1', { headers: { Authorization: 'Bearer ' + token } })
    const sd = await sign.json()
    if (!sd.urls) return NextResponse.json({ error: 'Sign failed', detail: sd }, { status: 500 })
    const put = await fetch(sd.urls[0], { method: 'PUT', body: buf })
    if (!put.ok) return NextResponse.json({ error: 'PUT failed: ' + put.status }, { status: 500 })
    const fin = await fetch('https://developer.api.autodesk.com/oss/v2/buckets/' + BUCKET_KEY + '/objects/' + objectKey + '/signeds3upload', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadKey: sd.uploadKey }),
    })
    const fd2 = await fin.json()
    if (!fd2.objectId) return NextResponse.json({ error: 'Finalize failed', detail: fd2 }, { status: 500 })
    const urn = Buffer.from(fd2.objectId).toString('base64').replace(/=/g, '')
    await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'x-ads-force': 'true' },
      body: JSON.stringify({ input: { urn }, output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] } }),
    })
    return NextResponse.json({ urn, fileName: file.name })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
