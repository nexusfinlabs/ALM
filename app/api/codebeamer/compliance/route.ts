import { NextRequest, NextResponse } from 'next/server'

const CB_URL = process.env.CODEBEAMER_URL || 'https://trial.codebeamer.com'
const CB_USER = process.env.CODEBEAMER_USER!
const CB_PASS = process.env.CODEBEAMER_PASSWORD!
const CB_PROJECT_ID = process.env.CODEBEAMER_PROJECT_ID!

type CBItem = {
  id: number
  name?: string
  status?: { name: string } | string
  priority?: { name: string }
  customFields?: { name: string; value?: unknown }[]
}

type CBTracker = { id: number; name: string; itemsCount?: number }

const authHeader = () => {
  const creds = Buffer.from(`${CB_USER}:${CB_PASS}`).toString('base64')
  return { Authorization: `Basic ${creds}`, Accept: 'application/json' }
}

async function fetchTrackers(): Promise<CBTracker[]> {
  const res = await fetch(`${CB_URL}/api/v3/projects/${CB_PROJECT_ID}/trackers`, {
    headers: authHeader(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Trackers fetch failed: ${res.status}`)
  return res.json()
}

async function fetchTrackerItems(trackerId: number): Promise<CBItem[]> {
  const res = await fetch(
    `${CB_URL}/api/v3/trackers/${trackerId}/items?pageSize=200`,
    { headers: authHeader(), cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.items || []
}

const findTracker = (trackers: CBTracker[], pattern: RegExp): CBTracker | undefined =>
  trackers.find(t => pattern.test(t.name))

const statusName = (item: CBItem): string => {
  if (typeof item.status === 'string') return item.status
  return item.status?.name || 'unknown'
}

const isClosedOrPassed = (item: CBItem): boolean => {
  const s = statusName(item).toLowerCase()
  return ['passed', 'closed', 'verified', 'accepted', 'completed', 'done'].some(k => s.includes(k))
}

const isOpenBug = (item: CBItem): boolean => {
  const s = statusName(item).toLowerCase()
  return ['new', 'open', 'in progress', 'reopened'].some(k => s.includes(k))
}

export async function GET(_req: NextRequest) {
  if (!CB_USER || !CB_PASS || !CB_PROJECT_ID) {
    return NextResponse.json(
      { error: 'Codebeamer credentials not configured', configured: false },
      { status: 503 }
    )
  }

  try {
    const trackers = await fetchTrackers()

    const prodTracker = findTracker(trackers, /product req/i)
    const hwReqTracker = findTracker(trackers, /hardware req/i)
    const swReqTracker = findTracker(trackers, /software req/i)
    const swTestTracker = findTracker(trackers, /software test/i)
    const hwTestTracker = findTracker(trackers, /hardware test/i)
    const bugTracker = findTracker(trackers, /bug/i)

    const [prodItems, hwReqItems, swReqItems, swTestItems, hwTestItems, bugItems] = await Promise.all([
      prodTracker ? fetchTrackerItems(prodTracker.id) : Promise.resolve([]),
      hwReqTracker ? fetchTrackerItems(hwReqTracker.id) : Promise.resolve([]),
      swReqTracker ? fetchTrackerItems(swReqTracker.id) : Promise.resolve([]),
      swTestTracker ? fetchTrackerItems(swTestTracker.id) : Promise.resolve([]),
      hwTestTracker ? fetchTrackerItems(hwTestTracker.id) : Promise.resolve([]),
      bugTracker ? fetchTrackerItems(bugTracker.id) : Promise.resolve([]),
    ])

    const totalReqs = prodItems.length + hwReqItems.length + swReqItems.length
    const totalTests = swTestItems.length + hwTestItems.length
    const passedTests = [...swTestItems, ...hwTestItems].filter(isClosedOrPassed).length
    const openBugs = bugItems.filter(isOpenBug).length

    const swCoverage = swReqItems.length > 0
      ? Math.round((swTestItems.length / swReqItems.length) * 100)
      : 0
    const hwCoverage = hwReqItems.length > 0
      ? Math.round((hwTestItems.length / hwReqItems.length) * 100)
      : 0
    const testPassRate = totalTests > 0
      ? Math.round((passedTests / totalTests) * 100)
      : 0

    const iso26262Score = Math.round((swCoverage * 0.4) + (hwCoverage * 0.3) + (testPassRate * 0.3))
    const iatfScore = Math.round(
      (totalReqs > 0 ? 100 : 0) * 0.3 +
      testPassRate * 0.4 +
      (openBugs === 0 ? 100 : Math.max(0, 100 - openBugs * 15)) * 0.3
    )
    const aspiceScore = Math.round((swCoverage * 0.5) + (testPassRate * 0.5))

    return NextResponse.json({
      configured: true,
      timestamp: new Date().toISOString(),
      project: { id: CB_PROJECT_ID, url: `${CB_URL}/project/${CB_PROJECT_ID}` },
      counts: {
        productReqs: prodItems.length,
        hardwareReqs: hwReqItems.length,
        softwareReqs: swReqItems.length,
        softwareTests: swTestItems.length,
        hardwareTests: hwTestItems.length,
        openBugs,
        totalReqs,
        totalTests,
        passedTests,
      },
      coverage: { sw: swCoverage, hw: hwCoverage, testPassRate },
      compliance: [
        {
          standard: 'ISO 26262',
          score: iso26262Score,
          status: iso26262Score >= 80 ? 'compliant' : iso26262Score >= 60 ? 'partial' : 'non-compliant',
          breakdown: [
            { metric: 'SW Test Coverage', value: swCoverage },
            { metric: 'HW Test Coverage', value: hwCoverage },
            { metric: 'Test Pass Rate', value: testPassRate },
          ],
        },
        {
          standard: 'IATF 16949',
          score: iatfScore,
          status: iatfScore >= 80 ? 'compliant' : iatfScore >= 60 ? 'partial' : 'non-compliant',
          breakdown: [
            { metric: 'Requirement Definition', value: totalReqs > 0 ? 100 : 0 },
            { metric: 'Test Pass Rate', value: testPassRate },
            { metric: 'Open Defects', value: openBugs === 0 ? 100 : Math.max(0, 100 - openBugs * 15) },
          ],
        },
        {
          standard: 'ASPICE L2',
          score: aspiceScore,
          status: aspiceScore >= 80 ? 'compliant' : aspiceScore >= 60 ? 'partial' : 'non-compliant',
          breakdown: [
            { metric: 'SWE.1 Coverage', value: swCoverage },
            { metric: 'SWE.4 Pass Rate', value: testPassRate },
          ],
        },
      ],
    })
  } catch (e) {
    return NextResponse.json(
      { error: String(e), configured: true },
      { status: 500 }
    )
  }
}
