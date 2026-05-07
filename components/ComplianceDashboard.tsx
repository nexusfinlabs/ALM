'use client'
import { useEffect, useState } from 'react'

type Compliance = {
  standard: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant'
  breakdown: { metric: string; value: number }[]
}

type Data = {
  configured: boolean
  counts?: {
    productReqs: number
    hardwareReqs: number
    softwareReqs: number
    softwareTests: number
    hardwareTests: number
    openBugs: number
    totalReqs: number
    passedTests: number
  }
  coverage?: { sw: number; hw: number; testPassRate: number }
  compliance?: Compliance[]
  project?: { url: string }
  timestamp?: string
  error?: string
}

const statusColor = (s: string) =>
  s === 'compliant' ? '#4ade80' : s === 'partial' ? '#f59e0b' : '#f87171'

const statusLabel = (s: string) =>
  s === 'compliant' ? 'COMPLIANT' : s === 'partial' ? 'PARTIAL' : 'NON-COMPLIANT'

export default function ComplianceDashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/codebeamer/compliance', { cache: 'no-store' })
      const d = await res.json()
      setData(d)
    } catch {
      setData({ configured: false, error: 'Connection failed' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 60000)
    return () => clearInterval(t)
  }, [])

  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) {
    return (
      <div className="border border-[rgba(255,255,255,0.06)] rounded-xl p-12 bg-[#0d0d10] text-center">
        <div className="w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="font-mono text-sm text-[#8892a4]">Connecting to Codebeamer...</div>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.04)] rounded-xl p-8">
        <div className="font-mono text-xs text-[#f59e0b] tracking-widest uppercase mb-2">Not Connected</div>
        <div className="font-display font-600 text-white mb-2">Codebeamer integration pending configuration</div>
        <div className="font-body text-sm text-[#8892a4]">
          Add CODEBEAMER_USER, CODEBEAMER_PASSWORD and CODEBEAMER_PROJECT_ID environment variables to enable live compliance tracking.
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.04)] rounded-xl p-6">
        <div className="font-mono text-xs text-[#f87171] uppercase tracking-widest mb-1">Connection Error</div>
        <div className="font-mono text-sm text-[#8892a4] break-all">{data.error}</div>
      </div>
    )
  }

  const c = data.counts!
  const compliance = data.compliance!

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#4ade80]" style={{ boxShadow: '0 0 8px #4ade80' }} />
          <span className="font-mono text-xs text-[#8892a4]">
            Live data from <a href={data.project?.url} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-white transition-colors">trial.codebeamer.com</a>
            {data.timestamp && <span className="ml-2 text-[#4b5563]">· refreshed {new Date(data.timestamp).toLocaleTimeString()}</span>}
          </span>
        </div>
        <button onClick={onRefresh} disabled={refreshing}
          className="font-mono text-xs text-[#00d4ff] border border-[rgba(0,212,255,0.3)] px-3 py-1 rounded hover:bg-[rgba(0,212,255,0.05)] transition-colors disabled:opacity-50">
          {refreshing ? 'refreshing...' : '↻ refresh'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {compliance.map((c, i) => (
          <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-xl p-6 bg-[#0d0d10] card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-display font-700 text-lg text-white">{c.standard}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: statusColor(c.status) }}>
                  {statusLabel(c.status)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-700 text-3xl" style={{ color: statusColor(c.status) }}>{c.score}<span className="text-base text-[#8892a4]">%</span></div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-[#1c1c22] rounded-full overflow-hidden mb-4">
              <div className="h-full transition-all duration-1000 rounded-full"
                style={{ width: `${c.score}%`, background: statusColor(c.status), boxShadow: `0 0 8px ${statusColor(c.status)}` }} />
            </div>

            <div className="space-y-1.5">
              {c.breakdown.map((b, j) => (
                <div key={j} className="flex items-center justify-between text-xs">
                  <span className="font-body text-[#8892a4]">{b.metric}</span>
                  <span className="font-mono text-white">{b.value}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Product Reqs', value: c.productReqs, color: '#00d4ff' },
          { label: 'Hardware Reqs', value: c.hardwareReqs, color: '#a78bfa' },
          { label: 'Software Reqs', value: c.softwareReqs, color: '#f59e0b' },
          { label: 'Test Cases', value: c.softwareTests + c.hardwareTests, color: '#4ade80' },
          { label: 'Tests Passed', value: c.passedTests, color: '#4ade80' },
          { label: 'Open Bugs', value: c.openBugs, color: c.openBugs > 0 ? '#f87171' : '#4ade80' },
          { label: 'SW Coverage', value: `${data.coverage?.sw || 0}%`, color: '#00d4ff' },
          { label: 'HW Coverage', value: `${data.coverage?.hw || 0}%`, color: '#00d4ff' },
        ].map((s, i) => (
          <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-4 bg-[#0d0d10]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8892a4] mb-1.5">{s.label}</div>
            <div className="font-display font-700 text-2xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
