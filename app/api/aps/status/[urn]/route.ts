import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { urn: string } }) {
  const { urn } = params
  const CLIENT_ID = process.env.APS_CLIENT_ID!
  const CLIENT_SECRET = process.env.APS_CLIENT_SECRET!
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

  const tokenRes = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=data%3Aread%20viewables%3Aread',
  })
  const { access_token } = await tokenRes.json()

  const res = await fetch(
    `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const data = await res.json()

  return NextResponse.json({
    status: data.status,
    progress: data.progress,
    urn,
  })
}
