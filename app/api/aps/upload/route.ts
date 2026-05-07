import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.APS_CLIENT_ID!
const CLIENT_SECRET = process.env.APS_CLIENT_SECRET!
const BUCKET_KEY = process.env.APS_BUCKET_KEY || 'struxai-models'

async function getToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=data%3Aread%20data%3Awrite%20data%3Acreate%20bucket%3Acreate%20bucket%3Aread%20viewables%3Aread',
  })
  const d = await res.json()
  return d.access_token as string
}

async function ensureBucket(token: string) {
  const check = await fetch(
    `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/details`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (check.status === 200) return
  await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucketKey: BUCKET_KEY, policyKey: 'persistent' }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const token = await getToken()
    await ensureBucket(token)

    const objectKey = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadRes = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${objectKey}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      }
    )
    const uploadData = await uploadRes.json()
    if (uploadRes.status !== 200) {
      return NextResponse.json({ error: 'Upload failed', detail: uploadData }, { status: 500 })
    }

    const urn = Buffer.from(uploadData.objectId).toString('base64').replace(/=/g, '')

    const translateRes = await fetch(
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
      {
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
      }
    )

    if (!translateRes.ok) {
      const e = await translateRes.json()
      return NextResponse.json({ error: 'Translation failed', detail: e }, { status: 500 })
    }

    return NextResponse.json({ urn, fileName: file.name })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
