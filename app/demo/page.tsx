'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import AspiceVModel from '@/components/AspiceVModel'

const DEFAULT_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c3RydXhhaS1tb2RlbHMvUElFWkFfUEIwMTMtU1BISU9OX0lOTk9WQVRJT04uc3Rw'

const REQUIREMENTS = {
  product: [
    { id: 'ADAS-PROD-001', name: 'Lane Keeping Assist System',     status: 'Approved', asil: 'B' },
    { id: 'ADAS-PROD-002', name: 'Autonomous Emergency Braking',   status: 'Approved', asil: 'D' },
    { id: 'ADAS-PROD-003', name: 'Adaptive Cruise Control',         status: 'Approved', asil: 'C' },
    { id: 'ADAS-PROD-004', name: 'Blind Spot Detection',            status: 'Approved', asil: 'B' },
    { id: 'ADAS-PROD-005', name: 'Driver Monitoring System',        status: 'Approved', asil: 'C' },
  ],
  hardware: [
    { id: 'ADAS-HW-001', name: 'Front camera 8MP HDR',             status: 'In Review', asil: 'B' },
    { id: 'ADAS-HW-002', name: 'Solid State LIDAR 905nm',          status: 'Approved',  asil: 'D' },
    { id: 'ADAS-HW-003', name: 'Long range radar 77GHz',           status: 'Approved',  asil: 'C' },
    { id: 'ADAS-HW-004', name: 'ADAS ECU Tegra Orin 275 TOPS',     status: 'Approved',  asil: 'D' },
    { id: 'ADAS-HW-005', name: 'Brake actuator CAN-FD interface',  status: 'In Review', asil: 'D' },
  ],
  software: [
    { id: 'ADAS-SW-001', name: 'Lane detection algorithm < 100ms', status: 'Approved', asil: 'B' },
    { id: 'ADAS-SW-002', name: 'Emergency brake response < 150ms', status: 'Approved', asil: 'D' },
    { id: 'ADAS-SW-003', name: 'CNN classifier > 99.5% accuracy',  status: 'In Review', asil: 'C' },
    { id: 'ADAS-SW-004', name: 'Sensor fusion 50Hz scheduler',     status: 'Approved', asil: 'B' },
    { id: 'ADAS-SW-005', name: 'Watchdog fail-safe < 50ms',        status: 'Approved', asil: 'D' },
  ],
  tests: [
    { id: 'ADAS-TC-001', name: 'Lane detection 100ms timing',     status: 'PASSED', asil: 'B' },
    { id: 'ADAS-TC-002', name: 'Emergency brake 150ms response',  status: 'PASSED', asil: 'D' },
    { id: 'ADAS-TC-003', name: 'CNN classifier EuroNCAP',          status: 'FAILED', asil: 'C' },
    { id: 'ADAS-TC-004', name: 'Sensor fusion 50Hz validation',   status: 'PASSED', asil: 'B' },
    { id: 'ADAS-TC-005', name: 'Watchdog fail-safe 50ms',          status: 'PASSED', asil: 'D' },
  ],
}

type TabKey = 'product' | 'hardware' | 'software' | 'tests'

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'product',  label: 'Product Reqs',  color: '#00d4ff' },
  { key: 'hardware', label: 'Hardware Reqs', color: '#a78bfa' },
  { key: 'software', label: 'Software Reqs', color: '#f59e0b' },
  { key: 'tests',    label: 'Test Cases',    color: '#4ade80' },
]

const statusColor = (s: string) => {
  if (s === 'PASSED' || s === 'Approved') return '#4ade80'
  if (s === 'FAILED') return '#f87171'
  return '#f59e0b'
}

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [urn, setUrn] = useState(DEFAULT_URN)
  const [tab, setTab] = useState<TabKey>('product')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css'
    document.head.appendChild(css)

    const s = document.createElement('script')
    s.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js'
    s.onload = async () => {
      try {
        const r = await fetch('/api/aps/token')
        const { access_token } = await r.json()
        if (!access_token) { setStatus('error'); return }
        const Autodesk = (window as any).Autodesk
        Autodesk.Viewing.Initializer(
          { env: 'AutodeskProduction2', api: 'streamingV2', accessToken: access_token },
          () => {
            const v = new Autodesk.Viewing.GuiViewer3D(containerRef.current, { theme: 'dark-theme' })
            v.start()
            Autodesk.Viewing.Document.load(
              'urn:' + urn,
              (doc: any) => {
                const view = doc.getRoot().getDefaultGeometry()
                if (!view) { setStatus('error'); return }
                v.loadDocumentNode(doc, view).then(() => setStatus('ready'))
              },
              () => setStatus('error')
            )
          }
        )
      } catch { setStatus('error') }
    }
    document.head.appendChild(s)
  }, [urn])

  const items = REQUIREMENTS[tab]

  return (
    <main className="min-h-screen bg-[#070709] text-white">
      <nav className="border-b border-[rgba(0,212,255,0.08)] bg-[rgba(7,7,9,0.9)] backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-[rgba(0,212,255,0.4)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-700 text-white">Nexus<span className="text-[#00d4ff]">ALM</span></span>
            <span className="text-[10px] font-mono text-[#8892a4] border border-[rgba(136,146,164,0.3)] px-1.5 py-0.5 rounded">DEMO · ADAS-SafetyCore</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-[#8892a4]">
              <div className="w-2 h-2 rounded-full bg-[#4ade80]" style={{ boxShadow: '0 0 6px #4ade80' }} />
              Connected to Codebeamer · trial.codebeamer.com
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-4">
          <h1 className="font-display font-700 text-2xl text-white">ADAS Sensor Module — SYS-002</h1>
          <p className="font-mono text-xs text-[#8892a4] mt-1">PIEZA PB013-SPHION INNOVATION.stp · Linked to system requirement ADAS-SYS-002</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 border border-[rgba(0,212,255,0.15)] rounded-xl overflow-hidden bg-[#0d0d10]">
            <div className="border-b border-[rgba(0,212,255,0.1)] px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-xs text-[#8892a4]">3D CAD Model · Autodesk APS Viewer</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
                style={{
                  color: status === 'ready' ? '#4ade80' : status === 'error' ? '#f87171' : '#f59e0b',
                  borderColor: status === 'ready' ? '#4ade8040' : status === 'error' ? '#f8717140' : '#f59e0b40',
                }}>
                {status === 'ready' ? 'LOADED' : status === 'error' ? 'ERROR' : 'LOADING'}
              </span>
            </div>
            <div ref={containerRef} className="w-full h-[600px] bg-[#1a1a1a] relative">
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <div className="font-mono text-xs text-[#8892a4]">Loading APS viewer...</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#0d0d10] flex flex-col">
            <div className="border-b border-[rgba(255,255,255,0.06)] flex">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 px-3 py-3 font-mono text-[10px] uppercase tracking-widest transition-all ${
                    tab === t.key ? 'text-white' : 'text-[#8892a4] hover:text-white'
                  }`}
                  style={tab === t.key ? { borderBottom: `2px solid ${t.color}`, background: `${t.color}10` } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2 max-h-[600px]">
              {items.map((it, i) => (
                <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-3 hover:border-[rgba(0,212,255,0.3)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs" style={{ color: TABS.find(t => t.key === tab)?.color }}>{it.id}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
                      style={{ color: statusColor(it.status), borderColor: `${statusColor(it.status)}40` }}>
                      {it.status}
                    </span>
                  </div>
                  <div className="font-body text-sm text-white mb-1.5 leading-snug">{it.name}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] px-1.5 py-0.5 rounded">ASIL {it.asil}</span>
                    <span className="font-mono text-[10px] text-[#8892a4]">→ Codebeamer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AspiceVModel />
      </div>
    </main>
  )
}
