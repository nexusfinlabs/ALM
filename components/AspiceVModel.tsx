'use client'
import { useState } from 'react'

type Req = { id: string; name: string; status?: string; asil?: string }
type Process = { code: string; name: string; reqs: Req[] }

const PROCESSES: Record<string, Process> = {
  'SYS.1': { code: 'SYS.1', name: 'Requirements Elicitation', reqs: [
    { id: 'STK-001', name: 'OEM demands AEB Level 2 function' },
    { id: 'STK-002', name: 'EuroNCAP 2025 five-star compliance' },
    { id: 'STK-003', name: 'EU Directive 2019/2144 mandate' },
    { id: 'STK-004', name: 'BOM target USD 850 per unit' },
  ]},
  'SYS.2': { code: 'SYS.2', name: 'System Requirements Analysis', reqs: [
    { id: 'ADAS-SYS-001', name: 'Lane detection latency < 100ms', asil: 'B' },
    { id: 'ADAS-SYS-002', name: 'Emergency brake activation < 150ms', asil: 'D' },
    { id: 'ADAS-SYS-003', name: 'Object classification > 99.5%', asil: 'C' },
    { id: 'ADAS-SYS-004', name: 'Sensor fusion rate > 50Hz', asil: 'B' },
  ]},
  'SYS.3': { code: 'SYS.3', name: 'System Architectural Design', reqs: [
    { id: 'ARCH-001', name: 'Centralized ECU on Tegra Orin' },
    { id: 'ARCH-002', name: 'Sensor fusion at central node' },
    { id: 'ARCH-003', name: 'Redundant power 50ms failover' },
    { id: 'ARCH-004', name: 'CAN-FD safety backbone' },
  ]},
  'SWE.1': { code: 'SWE.1', name: 'Software Requirements Analysis', reqs: [
    { id: 'ADAS-SW-001', name: 'DiagManager 20ms cycle', asil: 'B' },
    { id: 'ADAS-SW-002', name: 'Brake PWM within 150ms', asil: 'D' },
    { id: 'ADAS-SW-003', name: 'CNN 99.5% on EuroNCAP', asil: 'C' },
    { id: 'ADAS-SW-004', name: 'Kalman fusion 50Hz', asil: 'B' },
  ]},
  'SWE.2': { code: 'SWE.2', name: 'Software Architectural Design', reqs: [
    { id: 'SWA-001', name: 'AUTOSAR Adaptive on Linux RT' },
    { id: 'SWA-002', name: 'TensorRT inference engine' },
    { id: 'SWA-003', name: 'ROS 2 Humble fusion node' },
    { id: 'SWA-004', name: 'Watchdog with E2E protection' },
  ]},
  'SWE.3': { code: 'SWE.3', name: 'SW Detailed Design / Units', reqs: [
    { id: 'UNIT-001', name: 'lane_detector.cpp' },
    { id: 'UNIT-002', name: 'brake_controller.cpp' },
    { id: 'UNIT-003', name: 'cnn_classifier.py' },
    { id: 'UNIT-004', name: 'kalman_fusion.cpp' },
  ]},
  'SWE.4': { code: 'SWE.4', name: 'Software Unit Verification', reqs: [
    { id: 'UT-001', name: 'GoogleTest lane_detector (32 cases)', status: 'PASSED' },
    { id: 'UT-002', name: 'GoogleTest brake_controller (24 cases)', status: 'PASSED' },
    { id: 'UT-003', name: 'pytest cnn_classifier (45 cases)', status: '2 FAILED' },
    { id: 'UT-004', name: 'GoogleTest kalman_fusion (18 cases)', status: 'PASSED' },
  ]},
  'SWE.5': { code: 'SWE.5', name: 'SW Integration & Integration Test', reqs: [
    { id: 'IT-SW-001', name: 'Camera to fusion pipeline', status: 'PASSED' },
    { id: 'IT-SW-002', name: 'LIDAR to fusion pipeline', status: 'PASSED' },
    { id: 'IT-SW-003', name: 'Fault injection watchdog', status: 'PASSED' },
  ]},
  'SWE.6': { code: 'SWE.6', name: 'Software Qualification Test', reqs: [
    { id: 'QT-SW-001', name: 'Full SW stack on HIL bench', status: 'PASSED' },
    { id: 'QT-SW-002', name: '72h burn-in stress', status: 'PASSED' },
    { id: 'QT-SW-003', name: 'Thermal soak -40 to +105C', status: 'IN PROGRESS' },
  ]},
  'SYS.4': { code: 'SYS.4', name: 'System Integration & Integration Test', reqs: [
    { id: 'IT-SYS-001', name: 'Vehicle closed-loop AEB', status: 'PASSED' },
    { id: 'IT-SYS-002', name: 'Track test VRU dummies', status: 'PASSED' },
    { id: 'IT-SYS-003', name: 'Rain and fog adverse weather', status: 'IN PROGRESS' },
  ]},
  'SYS.5': { code: 'SYS.5', name: 'System Qualification Test', reqs: [
    { id: 'QT-SYS-001', name: 'EuroNCAP AEB protocol 2025', status: 'PASSED' },
    { id: 'QT-SYS-002', name: 'UN ECE R152 type approval', status: 'IN PROGRESS' },
    { id: 'QT-SYS-003', name: 'OEM customer acceptance', status: 'NOT STARTED' },
  ]},
}

const POS: Record<string, { x: number; y: number; side: 'left' | 'bottom' | 'right' }> = {
  'SYS.1': { x: 60,   y: 30,  side: 'left' },
  'SYS.2': { x: 200,  y: 110, side: 'left' },
  'SYS.3': { x: 340,  y: 190, side: 'left' },
  'SWE.1': { x: 480,  y: 270, side: 'left' },
  'SWE.2': { x: 620,  y: 350, side: 'left' },
  'SWE.3': { x: 760,  y: 430, side: 'bottom' },
  'SWE.4': { x: 920,  y: 430, side: 'bottom' },
  'SWE.5': { x: 1060, y: 350, side: 'right' },
  'SWE.6': { x: 1200, y: 270, side: 'right' },
  'SYS.4': { x: 1340, y: 190, side: 'right' },
  'SYS.5': { x: 1480, y: 110, side: 'right' },
}

const TRACES: [string, string][] = [
  ['SYS.1', 'SYS.2'], ['SYS.2', 'SYS.3'], ['SYS.3', 'SWE.1'],
  ['SWE.1', 'SWE.2'], ['SWE.2', 'SWE.3'], ['SWE.3', 'SWE.4'],
  ['SWE.4', 'SWE.5'], ['SWE.5', 'SWE.6'], ['SWE.6', 'SYS.4'], ['SYS.4', 'SYS.5'],
  ['SYS.2', 'SYS.5'], ['SYS.3', 'SYS.4'], ['SWE.1', 'SWE.6'], ['SWE.2', 'SWE.5'],
]

const sideColor = (s: string) => s === 'left' ? '#00d4ff' : s === 'right' ? '#4ade80' : '#f59e0b'

const statusColor = (s?: string) => {
  if (!s) return '#8892a4'
  if (s === 'PASSED') return '#4ade80'
  if (s.includes('FAILED')) return '#f87171'
  if (s.includes('PROGRESS')) return '#f59e0b'
  return '#8892a4'
}

export default function AspiceVModel() {
  const [active, setActive] = useState<string>('SYS.2')
  const [view, setView] = useState<'vmodel' | 'flow'>('vmodel')

  const proc = PROCESSES[active]

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#0d0d10] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-xs text-[#00d4ff] uppercase tracking-widest mb-1">ASPICE Process Model</div>
          <h3 className="font-display font-700 text-white">Automotive SPICE V-Model · click any process</h3>
        </div>
        <div className="flex border border-[rgba(0,212,255,0.2)] rounded-lg overflow-hidden">
          <button onClick={() => setView('vmodel')}
            className={`px-4 py-1.5 font-mono text-xs uppercase transition-colors ${view === 'vmodel' ? 'bg-[#00d4ff] text-black' : 'text-[#8892a4] hover:text-white'}`}>
            V-Model
          </button>
          <button onClick={() => setView('flow')}
            className={`px-4 py-1.5 font-mono text-xs uppercase transition-colors ${view === 'flow' ? 'bg-[#00d4ff] text-black' : 'text-[#8892a4] hover:text-white'}`}>
            Flow
          </button>
        </div>
      </div>

      {view === 'vmodel' && (
        <svg viewBox="0 0 1600 540" className="w-full">
          <defs>
            <marker id="vmarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00d4ff" opacity="0.6" />
            </marker>
          </defs>

          {TRACES.map(([from, to], i) => {
            const a = POS[from], b = POS[to]
            return (
              <line key={i}
                x1={a.x + 60} y1={a.y + 60} x2={b.x + 60} y2={b.y + 60}
                stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 4"
                opacity={active === from || active === to ? '0.9' : '0.2'}
                markerEnd="url(#vmarr)" />
            )
          })}

          {Object.entries(POS).map(([code, p]) => {
            const isActive = code === active
            const c = sideColor(p.side)
            return (
              <g key={code} className="cursor-pointer" onClick={() => setActive(code)}>
                <rect x={p.x} y={p.y} width={120} height={60} rx="8"
                  fill={isActive ? c : '#141418'}
                  stroke={c} strokeWidth={isActive ? 2 : 1.5}
                  opacity={isActive ? 1 : 0.85} />
                <text x={p.x + 60} y={p.y + 25} textAnchor="middle"
                  fill={isActive ? '#070709' : c}
                  fontSize="14" fontFamily="monospace" fontWeight="700">{code}</text>
                <text x={p.x + 60} y={p.y + 45} textAnchor="middle"
                  fill={isActive ? '#070709' : '#8892a4'}
                  fontSize="9" fontFamily="sans-serif">{PROCESSES[code].reqs.length} reqs</text>
              </g>
            )
          })}

          <text x="80" y="510" fill="#00d4ff" fontSize="10" fontFamily="monospace" letterSpacing="2">DECOMPOSITION →</text>
          <text x="1380" y="510" fill="#4ade80" fontSize="10" fontFamily="monospace" letterSpacing="2">← INTEGRATION</text>
        </svg>
      )}

      {view === 'flow' && (
        <div className="overflow-x-auto py-4">
          <div className="flex gap-3 min-w-max">
            {Object.values(PROCESSES).map((p, i, arr) => (
              <div key={p.code} className="flex items-center">
                <div onClick={() => setActive(p.code)}
                  className={`w-44 border rounded-lg p-3 cursor-pointer transition-all ${
                    active === p.code ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'border-[rgba(255,255,255,0.08)] bg-[#141418] hover:border-[rgba(0,212,255,0.3)]'
                  }`}>
                  <div className="font-mono text-xs font-700" style={{ color: sideColor(POS[p.code].side) }}>{p.code}</div>
                  <div className="font-body text-[11px] text-white mt-1 leading-snug">{p.name}</div>
                  <div className="font-mono text-[10px] text-[#8892a4] mt-2">{p.reqs.length} requirements</div>
                </div>
                {i < arr.length - 1 && <div className="text-[#00d4ff] mx-1 text-xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-[rgba(0,212,255,0.2)] rounded-lg bg-[#141418] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-mono text-sm font-700" style={{ color: sideColor(POS[active].side) }}>{proc.code}</div>
              <div className="font-display font-700 text-white">{proc.name}</div>
            </div>
            <span className="font-mono text-[10px] text-[#8892a4] border border-[rgba(136,146,164,0.3)] px-2 py-0.5 rounded">
              {proc.reqs.length} items in Codebeamer
            </span>
          </div>
          <div className="space-y-2">
            {proc.reqs.map((r, i) => (
              <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded p-3 hover:border-[rgba(0,212,255,0.3)] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#00d4ff]">{r.id}</span>
                  <div className="flex gap-1.5">
                    {r.asil && <span className="font-mono text-[10px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] px-1.5 py-0.5 rounded">ASIL {r.asil}</span>}
                    {r.status && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border" style={{ color: statusColor(r.status), borderColor: `${statusColor(r.status)}40` }}>{r.status}</span>}
                  </div>
                </div>
                <div className="font-body text-sm text-white">{r.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[rgba(255,255,255,0.06)] rounded-lg bg-[#141418] p-5">
          <div className="font-mono text-xs text-[#8892a4] uppercase tracking-widest mb-3">Linked Processes</div>
          <div className="space-y-2">
            {TRACES.filter(([f, t]) => f === active || t === active).map(([f, t], i) => {
              const target = f === active ? t : f
              const dir = f === active ? '→ downstream' : '← upstream'
              return (
                <div key={i} onClick={() => setActive(target)}
                  className="border border-[rgba(255,255,255,0.06)] rounded p-2.5 cursor-pointer hover:border-[rgba(0,212,255,0.3)] transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-700" style={{ color: sideColor(POS[target].side) }}>{target}</div>
                    <div className="font-body text-[11px] text-[#8892a4]">{PROCESSES[target].name}</div>
                  </div>
                  <span className="font-mono text-[10px] text-[#8892a4]">{dir}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
