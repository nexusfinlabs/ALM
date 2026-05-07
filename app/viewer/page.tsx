'use client'
import { useEffect, useRef, useState } from 'react'

declare global { interface Window { Autodesk: any } }

export default function ViewerPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [urn, setUrn] = useState('dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c3RydXhhaS1tb2RlbHMvUElFWkFfUEIwMTMtU1BISU9OX0lOTk9WQVRJT04uc3Rw')
  const [logs, setLogs] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  const log = (m: string) => { console.log('[Viewer]', m); setLogs(p => [...p.slice(-12), m]) }

  useEffect(() => {
    if (document.getElementById('aps-script')) { setReady(true); return }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css'
    document.head.appendChild(css)
    const s = document.createElement('script')
    s.id = 'aps-script'
    s.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js'
    s.onload = () => { log('SDK loaded'); setReady(true) }
    document.head.appendChild(s)
  }, [])

  const load = async () => {
    log('Fetching token...')
    const r = await fetch('/api/aps/token')
    const { access_token } = await r.json()
    if (!access_token) { log('NO TOKEN'); return }
    log('Token OK')
    window.Autodesk.Viewing.Initializer(
      { env: 'AutodeskProduction2', api: 'streamingV2', accessToken: access_token },
      () => {
        log('Init OK')
        const v = new window.Autodesk.Viewing.GuiViewer3D(containerRef.current)
        v.start()
        log('Viewer started')
        window.Autodesk.Viewing.Document.load(
          'urn:' + urn,
          (doc: any) => {
            log('Doc loaded')
            const view = doc.getRoot().getDefaultGeometry()
            if (!view) { log('NO GEOMETRY'); return }
            v.loadDocumentNode(doc, view).then(() => log('RENDERED'))
          },
          (errCode: any, errMsg: any) => log('ERROR ' + errCode + ' ' + errMsg)
        )
      }
    )
  }

  return (
    <main className="min-h-screen bg-[#070709] text-white p-6">
      <h1 className="text-2xl mb-4 text-[#00d4ff] font-mono">APS Viewer Debug</h1>
      <div className="flex gap-2 mb-4">
        <input value={urn} onChange={e => setUrn(e.target.value)}
          className="flex-1 bg-black border border-[#333] px-3 py-2 font-mono text-xs rounded" />
        <button onClick={load} disabled={!ready}
          className="bg-[#00d4ff] text-black px-6 py-2 rounded font-bold disabled:opacity-50">
          {ready ? 'LOAD' : 'Loading...'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div ref={containerRef} className="h-[600px] bg-[#1a1a1a] border border-[#00d4ff] rounded relative" />
        <div className="bg-black border border-[#333] rounded p-4 font-mono text-xs space-y-1 h-[600px] overflow-auto">
          <div className="text-[#00d4ff] mb-2">DEBUG LOG</div>
          {logs.map((l, i) => <div key={i} className="text-[#8892a4]">[{i}] {l}</div>)}
        </div>
      </div>
    </main>
  )
}
