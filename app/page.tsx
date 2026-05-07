'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const COMPETITORS = [
  { name: 'IBM DOORS Next', tag: 'ELM', color: '#006699' },
  { name: 'Siemens Polarion', tag: 'ALM', color: '#009999' },
  { name: 'Jama Connect', tag: 'REQ', color: '#e85d04' },
  { name: 'Jira Atlassian', tag: 'PM', color: '#0052cc' },
  { name: 'Perforce Helix', tag: 'ALM', color: '#7b2d8b' },
  { name: 'Visure Solutions', tag: 'REQ', color: '#1a7f37' },
  { name: 'Trace.Space', tag: 'AI', color: '#d4a017' },
  { name: 'PTC Codebeamer', tag: 'ALM', color: '#e63946' },
  { name: 'JAMA Connect', tag: 'REQ', color: '#e85d04' },
  { name: 'IBM DOORS Next', tag: 'ELM', color: '#006699' },
  { name: 'Siemens Polarion', tag: 'ALM', color: '#009999' },
  { name: 'Jira Atlassian', tag: 'PM', color: '#0052cc' },
  { name: 'Perforce Helix', tag: 'ALM', color: '#7b2d8b' },
  { name: 'Visure Solutions', tag: 'REQ', color: '#1a7f37' },
  { name: 'Trace.Space', tag: 'AI', color: '#d4a017' },
  { name: 'PTC Codebeamer', tag: 'ALM', color: '#e63946' },
]

const STANDARDS = ['ISO 26262', 'ASPICE L2+', 'IEC 61508', 'DO-178C', 'IEC 62443', 'ISO 21434', 'EN 50128', 'AUTOSAR']

const TRACE_CHAIN = [
  { id: 'SYS-002', label: 'System Req', desc: 'ICE→EV transition < 200ms', asil: 'ASIL C', color: '#00d4ff' },
  { id: 'SW-003', label: 'SW Req', desc: 'FSM watchdog 150ms timeout', asil: 'ASIL C', color: '#a78bfa' },
  { id: 'TC-003', label: 'Test Case', desc: 'Verify transition timing HIL', asil: 'PASSED', color: '#f59e0b' },
  { id: 'DEF-001', label: 'Defect', desc: 'Actual: 240ms — fix in SW-003.2', asil: 'CLOSED', color: '#f87171' },
]

const CAD_FORMATS = [
  { ext: '3DXML', src: '3DEXPERIENCE' },
  { ext: 'CATPart', src: 'CATIA V5/V6' },
  { ext: 'CATProduct', src: 'CATIA Assembly' },
  { ext: 'SLDPRT', src: 'SOLIDWORKS' },
  { ext: 'STEP / STP', src: 'Neutral ISO 10303' },
  { ext: 'IGES', src: 'Neutral ANSI' },
  { ext: 'JT', src: 'Siemens Viewer' },
  { ext: 'OBJ / STL', src: 'Mesh / Simulation' },
]

declare global {
  interface Window {
    Autodesk: {
      Viewing: {
        Initializer: (opts: Record<string, unknown>, cb: () => void) => void
        GuiViewer3D: new (container: HTMLElement, config?: Record<string, unknown>) => {
          start: () => void
          loadDocumentNode: (doc: unknown, nodes: unknown[]) => void
        }
        Document: {
          load: (
            urn: string,
            onSuccess: (doc: unknown) => void,
            onError: (err: unknown) => void
          ) => void
          getSubItemsWithProperties: (root: unknown, props: Record<string, unknown>, recursive: boolean) => unknown[]
        }
      }
    }
  }
}

export default function Home() {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [urn, setUrn] = useState('')
  const [viewerStatus, setViewerStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [activeTrace, setActiveTrace] = useState(0)
  const [uploadName, setUploadName] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrace(p => (p + 1) % TRACE_CHAIN.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  const loadViewer = async () => {
    if (!urn.trim()) return
    setViewerStatus('loading')
    try {
      const res = await fetch('/api/aps/token')
      const { access_token } = await res.json()
      if (!access_token) throw new Error('No token')

      const script = document.createElement('script')
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js'
      script.onload = () => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css'
        document.head.appendChild(link)

        window.Autodesk.Viewing.Initializer({ accessToken: access_token }, () => {
          if (!viewerRef.current) return
          const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current)
          viewer.start()
          const encodedUrn = urn.startsWith('urn:') ? btoa(urn) : urn
          window.Autodesk.Viewing.Document.load(
            `urn:${encodedUrn}`,
            (doc: unknown) => {
              const views = window.Autodesk.Viewing.Document.getSubItemsWithProperties(
                (doc as { getRoot: () => unknown }).getRoot(),
                { type: 'geometry' },
                true
              )
              viewer.loadDocumentNode(doc, views)
              setViewerStatus('ready')
            },
            () => setViewerStatus('error')
          )
        })
      }
      document.head.appendChild(script)
    } catch {
      setViewerStatus('error')
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(7,7,9,0.85)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-[rgba(0,212,255,0.4)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-700 text-white tracking-tight">Nexus<span className="text-[#00d4ff]">ALM</span></span>
            <span className="text-[10px] font-mono text-[#8892a4] border border-[rgba(136,146,164,0.3)] px-1.5 py-0.5 rounded">by NexusFinLabs</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8892a4] font-body">
            <a href="#traceability" className="hover:text-white transition-colors">Traceability</a>
            <a href="#viewer" className="hover:text-white transition-colors">CAD Viewer</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
          </div>
          <a
            href="mailto:hola@nexusfinlabs.com"
            className="text-sm font-display font-600 text-[#070709] bg-[#00d4ff] px-4 py-1.5 rounded hover:bg-white transition-colors"
          >
            Request Demo
          </a>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgba(0,212,255,0.04)] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[rgba(245,158,11,0.04)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 border border-[rgba(0,212,255,0.2)] rounded-full px-4 py-1.5 mb-8 fade-up delay-1">
            <div className="status-dot" />
            <span className="text-xs font-mono text-[#00d4ff] tracking-widest uppercase">ISO 26262 · ASPICE · IEC 61508</span>
          </div>

          <h1 className="font-display font-800 text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6 fade-up delay-2">
            Requirement<br />
            <span className="text-[#00d4ff] text-glow">Traceability</span><br />
            Intelligence
          </h1>

          <p className="font-body font-300 text-lg md:text-xl text-[#8892a4] max-w-2xl mx-auto mb-10 leading-relaxed fade-up delay-3">
            End-to-end ALM traceability from system requirements to verified test evidence —
            with live CAD model linkage from 3DEXPERIENCE, CATIA and SOLIDWORKS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-up delay-4">
            <a
              href="#viewer"
              className="w-full sm:w-auto text-center font-display font-600 text-[#070709] bg-[#00d4ff] px-8 py-3 rounded hover:bg-white transition-all glow-cyan"
            >
              View Live CAD Demo →
            </a>
            <a
              href="#traceability"
              className="w-full sm:w-auto text-center font-display font-600 text-[#00d4ff] border border-[rgba(0,212,255,0.3)] px-8 py-3 rounded hover:bg-[rgba(0,212,255,0.05)] transition-all"
            >
              Explore Traceability
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="rgba(136,146,164,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      <section className="border-y border-[rgba(0,212,255,0.08)] py-5 overflow-hidden" id="integrations">
        <div className="logos-track">
          {COMPETITORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 px-8 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              <span className="font-display font-600 text-sm text-[#8892a4] hover:text-white transition-colors cursor-default">
                {c.name}
              </span>
              <span className="font-mono text-[10px] border px-1 rounded" style={{ color: c.color, borderColor: `${c.color}40` }}>
                {c.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24" id="traceability">
        <div className="mb-16">
          <div className="font-mono text-xs text-[#00d4ff] tracking-widest uppercase mb-3">Traceability Engine</div>
          <h2 className="font-display font-700 text-4xl md:text-5xl text-white leading-tight mb-4">
            Full chain. Zero gaps.<br />
            <span className="text-[#8892a4] font-300">System → Software → Test → Evidence.</span>
          </h2>
          <p className="text-[#8892a4] font-body max-w-xl leading-relaxed">
            Every requirement linked to its origin, its implementation, its test case, and its compliance evidence.
            Auditable at any point in the lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {TRACE_CHAIN.map((item, i) => (
            <div
              key={i}
              className={`relative border rounded-lg p-5 card-hover cursor-pointer transition-all duration-500 ${
                activeTrace === i
                  ? 'border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.04)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[#0d0d10]'
              }`}
              onClick={() => setActiveTrace(i)}
            >
              {i < TRACE_CHAIN.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-4 h-px bg-[rgba(0,212,255,0.3)] z-10" />
              )}
              <div className="font-mono text-[10px] text-[#8892a4] uppercase tracking-widest mb-2">{item.label}</div>
              <div className="font-mono font-500 text-sm mb-1" style={{ color: item.color }}>{item.id}</div>
              <div className="font-body text-sm text-white mb-3 leading-snug">{item.desc}</div>
              <div className="inline-block font-mono text-[10px] px-2 py-0.5 rounded border"
                style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}10` }}>
                {item.asil}
              </div>
              {activeTrace === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg" style={{ background: item.color }} />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Upstream Coverage', value: '100%', desc: 'All SW requirements linked to system-level origin', icon: '↑' },
            { title: 'Test Coverage', value: '6 / 7', desc: 'SYS-003, SYS-004, SYS-005 pending test case assignment', icon: '✓' },
            { title: 'Open Defects', value: 'DEF-001', desc: 'ICE→EV transition 240ms — exceeds 200ms limit', icon: '⚠' },
          ].map((stat, i) => (
            <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6 bg-[#0d0d10] card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="font-mono text-xs text-[#8892a4] uppercase tracking-widest">{stat.title}</div>
                <div className="w-7 h-7 rounded border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-[#00d4ff] text-sm">{stat.icon}</div>
              </div>
              <div className="font-display font-700 text-2xl text-white mb-1">{stat.value}</div>
              <div className="font-body text-sm text-[#8892a4] leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24" id="viewer">
        <div className="mb-10">
          <div className="font-mono text-xs text-[#f59e0b] tracking-widest uppercase mb-3">Live CAD Integration</div>
          <h2 className="font-display font-700 text-4xl text-white mb-4">
            CAD artifacts linked<br />
            <span className="text-[#8892a4] font-300">directly to requirements.</span>
          </h2>
          <p className="text-[#8892a4] font-body max-w-xl leading-relaxed">
            Models from 3DEXPERIENCE, CATIA or SOLIDWORKS attached to system requirements.
            Powered by Autodesk APS (Forge) — no plugin, no install, browser-native.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-8">
          {CAD_FORMATS.map((f, i) => (
            <div key={i} className="border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.03)] rounded p-3">
              <div className="font-mono text-sm text-[#f59e0b] font-500 mb-0.5">{f.ext}</div>
              <div className="font-body text-xs text-[#8892a4]">{f.src}</div>
            </div>
          ))}
        </div>

        <div className="border border-[rgba(0,212,255,0.15)] rounded-xl overflow-hidden bg-[#0d0d10]">
          <div className="border-b border-[rgba(0,212,255,0.1)] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="status-dot" />
              <span className="font-mono text-xs text-[#8892a4]">
                Linked to: <span className="text-[#00d4ff]">SYS-002</span> — ICE→EV transition module
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8892a4] border border-[rgba(136,146,164,0.2)] px-2 py-0.5 rounded">
              APS Viewer v7
            </span>
          </div>

          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={urn}
                onChange={e => setUrn(e.target.value)}
                placeholder="Paste APS model URN (base64)..."
                className="flex-1 bg-[#141418] border border-[rgba(255,255,255,0.1)] rounded px-4 py-2.5 font-mono text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
              />
              <button
                onClick={loadViewer}
                disabled={!urn.trim() || viewerStatus === 'loading'}
                className="font-display font-600 text-sm text-[#070709] bg-[#00d4ff] px-6 py-2.5 rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {viewerStatus === 'loading' ? 'Loading...' : 'Load Model'}
              </button>
            </div>

            <div className="forge-viewer-container relative">
              <div ref={viewerRef} id="forgeViewer" />
              {viewerStatus === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-xl border border-[rgba(0,212,255,0.2)] flex items-center justify-center mb-4 animate-float">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#00d4ff" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M16 4v24M4 10l12 6 12-6" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.4" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="font-display font-600 text-white mb-1">3D Model Viewer</div>
                  <div className="font-body text-sm text-[#8892a4] max-w-xs">
                    Paste an APS model URN above to render your CAD file inline.
                    Supports STEP, CATIA, SOLIDWORKS, 3DXML.
                  </div>
                  <div className="mt-4 font-mono text-xs text-[#4b5563]">
                    APS → OSS bucket → Model Derivative → URN
                  </div>
                </div>
              )}
              {viewerStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-mono text-[#f87171] text-sm mb-1">⚠ Viewer error</div>
                    <div className="font-body text-xs text-[#8892a4]">Check URN format or APS credentials in .env</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(255,255,255,0.06)] py-12 px-6" id="compliance">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-xs text-[#8892a4] uppercase tracking-widest mb-6 text-center">Compliance Standards Supported</div>
          <div className="flex flex-wrap justify-center gap-4">
            {STANDARDS.map((s, i) => (
              <div key={i} className="border border-[rgba(0,212,255,0.15)] rounded px-4 py-2 font-mono text-sm text-[#00d4ff] bg-[rgba(0,212,255,0.04)] hover:border-[rgba(0,212,255,0.4)] transition-colors cursor-default">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: 'Integration',
              title: 'Connects to your stack',
              desc: 'Native connectors for Codebeamer, DOORS, Polarion, Jama, and Jira. Bidirectional sync via REST and ReqIF.',
              items: ['ReqIF import/export', 'REST API + webhooks', 'CI/CD pipeline sync', 'OSLC compliance'],
            },
            {
              tag: 'Traceability',
              title: 'End-to-end coverage',
              desc: 'From customer needs to test evidence. Traceability matrix auto-generated for every audit point.',
              items: ['Upstream / downstream links', 'Impact analysis on change', 'Baseline & configuration mgmt', 'ASPICE Work Products'],
            },
            {
              tag: 'CAD Linkage',
              title: '3D model in context',
              desc: 'System requirements linked to physical geometry. Autodesk APS renders CATIA, STEP and SOLIDWORKS in-browser.',
              items: ['3DEXPERIENCE / CATIA', 'SOLIDWORKS .sldprt', 'STEP AP214 / AP242', 'JT, 3DXML, PDF 3D'],
            },
          ].map((f, i) => (
            <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-xl p-7 bg-[#0d0d10] card-hover">
              <div className="font-mono text-[10px] text-[#00d4ff] uppercase tracking-widest mb-4">{f.tag}</div>
              <h3 className="font-display font-700 text-xl text-white mb-3">{f.title}</h3>
              <p className="font-body text-sm text-[#8892a4] mb-5 leading-relaxed">{f.desc}</p>
              <ul className="space-y-2">
                {f.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 font-body text-sm text-[#6b7280]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[rgba(255,255,255,0.06)] px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-800 text-4xl text-white mb-4">
            Ready to trace everything?
          </h2>
          <p className="font-body text-[#8892a4] mb-8 max-w-xl mx-auto leading-relaxed">
            NexusFinLabs implements and customizes ALM traceability pipelines for automotive, aerospace and medical teams.
          </p>
          <a
            href="mailto:hola@nexusfinlabs.com"
            className="inline-block font-display font-600 text-[#070709] bg-[#00d4ff] px-10 py-4 rounded hover:bg-white transition-all glow-cyan text-lg"
          >
            Contact NexusFinLabs →
          </a>
          <div className="mt-6 font-mono text-xs text-[#4b5563]">hola@nexusfinlabs.com · nexusfinlabs.com</div>
        </div>
      </section>

      <footer className="border-t border-[rgba(255,255,255,0.04)] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#4b5563] font-mono">
          <div>© 2025 NexusFinLabs · NexusALM</div>
          <div className="flex gap-6">
            <a href="https://nexusfinlabs.com" className="hover:text-[#8892a4] transition-colors">nexusfinlabs.com</a>
            <a href="https://www.linkedin.com/in/ajleblob/" className="hover:text-[#8892a4] transition-colors">LinkedIn</a>
            <a href="https://alberto-lobo-portfolio.vercel.app/" className="hover:text-[#8892a4] transition-colors">Portfolio</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
