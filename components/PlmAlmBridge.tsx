'use client'

const PLM_ARTIFACTS = [
  { id: 'CAD',  name: 'CAD Models',         desc: '3DEXPERIENCE / CATIA / SOLIDWORKS', count: 142 },
  { id: 'BOM',  name: 'eBOM / mBOM',         desc: 'Engineering and manufacturing BOM',  count: 38 },
  { id: 'ECR',  name: 'Change Requests',     desc: 'ECR / ECO / ECN flow',                count: 12 },
  { id: 'CFG',  name: 'Configurations',      desc: '150% BOM with effectivity rules',    count: 7 },
  { id: 'MFG',  name: 'Manufacturing data',  desc: 'Process plans, work instructions',   count: 24 },
]

const ALM_ARTIFACTS = [
  { id: 'REQ', name: 'Requirements',         desc: 'System / SW / HW requirements',     count: 187 },
  { id: 'TST', name: 'Test Cases',            desc: 'Unit / Integration / System tests', count: 312 },
  { id: 'BUG', name: 'Defects',               desc: 'Bugs and non-conformances',         count: 23 },
  { id: 'CRQ', name: 'Change Requests',       desc: 'Software change management',        count: 18 },
  { id: 'BSL', name: 'Baselines',             desc: 'Frozen snapshots for audit',        count: 9 },
]

const BRIDGE_FLOWS = [
  { from: 'CAD', to: 'REQ', label: 'CAD → System Req',     desc: 'Component linked to safety goal' },
  { from: 'BOM', to: 'REQ', label: 'BOM ↔ HW Req',          desc: 'Part numbers traced to spec' },
  { from: 'ECR', to: 'CRQ', label: 'ECR ↔ Software CRQ',    desc: 'Mechanical change → SW impact' },
  { from: 'CFG', to: 'BSL', label: 'Configuration ↔ Baseline', desc: 'Variant snapshot for audit' },
]

export default function PlmAlmBridge() {
  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#0d0d10] p-6">
      <div className="mb-6">
        <div className="font-mono text-xs text-[#00d4ff] uppercase tracking-widest mb-1">PLM ↔ ALM Integration</div>
        <h3 className="font-display font-700 text-white text-xl">Closing the gap between physical and digital engineering</h3>
        <p className="font-body text-sm text-[#8892a4] mt-2 max-w-3xl leading-relaxed">
          NexusALM bridges product lifecycle (mechanical, BOM, CAD) and application lifecycle (requirements, software, tests).
          Every CAD artifact is linked to its requirement, every requirement to its test, every test to its evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        <div className="border border-[rgba(167,139,250,0.2)] rounded-xl bg-[rgba(167,139,250,0.03)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] text-[#a78bfa] uppercase tracking-widest">Product Lifecycle</div>
              <div className="font-display font-700 text-white text-lg">PLM</div>
            </div>
            <div className="font-mono text-[10px] text-[#a78bfa] border border-[rgba(167,139,250,0.3)] px-2 py-0.5 rounded">
              3DEXPERIENCE · Teamcenter
            </div>
          </div>
          <div className="space-y-2">
            {PLM_ARTIFACTS.map(a => (
              <div key={a.id} className="border border-[rgba(167,139,250,0.15)] bg-[#0d0d10] rounded-lg p-3 hover:border-[rgba(167,139,250,0.4)] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#a78bfa] bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] rounded px-1.5 py-0.5">{a.id}</span>
                    <span className="font-display font-600 text-sm text-white">{a.name}</span>
                  </div>
                  <span className="font-mono text-xs text-[#a78bfa]">{a.count}</span>
                </div>
                <div className="font-body text-xs text-[#8892a4]">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center px-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#00d4ff]" />
          <div className="border-2 border-[#00d4ff] rounded-xl bg-[#070709] p-4 my-2 text-center" style={{ boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
            <div className="font-mono text-[10px] text-[#00d4ff] uppercase tracking-widest mb-1">NexusALM</div>
            <div className="font-display font-700 text-white text-sm whitespace-nowrap">Traceability Engine</div>
            <div className="font-mono text-[10px] text-[#8892a4] mt-1">{BRIDGE_FLOWS.length} active flows</div>
          </div>
          <div className="w-px h-8 bg-gradient-to-t from-transparent to-[#00d4ff]" />
        </div>

        <div className="border border-[rgba(245,158,11,0.2)] rounded-xl bg-[rgba(245,158,11,0.03)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-widest">Application Lifecycle</div>
              <div className="font-display font-700 text-white text-lg">ALM</div>
            </div>
            <div className="font-mono text-[10px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] px-2 py-0.5 rounded">
              Codebeamer · DOORS · Jira
            </div>
          </div>
          <div className="space-y-2">
            {ALM_ARTIFACTS.map(a => (
              <div key={a.id} className="border border-[rgba(245,158,11,0.15)] bg-[#0d0d10] rounded-lg p-3 hover:border-[rgba(245,158,11,0.4)] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded px-1.5 py-0.5">{a.id}</span>
                    <span className="font-display font-600 text-sm text-white">{a.name}</span>
                  </div>
                  <span className="font-mono text-xs text-[#f59e0b]">{a.count}</span>
                </div>
                <div className="font-body text-xs text-[#8892a4]">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-[rgba(255,255,255,0.06)] pt-6">
        <div className="font-mono text-xs text-[#00d4ff] uppercase tracking-widest mb-3">Active Cross-Domain Flows</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRIDGE_FLOWS.map((f, i) => (
            <div key={i} className="border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.03)] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="font-mono text-[10px] text-[#a78bfa] bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] rounded px-1.5 py-0.5">{f.from}</span>
                <span className="text-[#00d4ff] text-xs">→</span>
                <span className="font-mono text-[10px] text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded px-1.5 py-0.5">{f.to}</span>
              </div>
              <div className="font-display font-600 text-sm text-white mb-1">{f.label}</div>
              <div className="font-body text-xs text-[#8892a4] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'PLM Artifacts', value: 223, color: '#a78bfa' },
          { label: 'ALM Items',     value: 549, color: '#f59e0b' },
          { label: 'Active Links',  value: 1147, color: '#00d4ff' },
          { label: 'Audit Coverage', value: '94%', color: '#4ade80' },
        ].map((s, i) => (
          <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-4 bg-[#0a0a0c]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8892a4] mb-1.5">{s.label}</div>
            <div className="font-display font-700 text-2xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
