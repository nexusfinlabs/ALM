'use client'

const LOGOS = [
  { name: 'Jira',         slug: 'jira',           color: '0052cc' },
  { name: 'Confluence',   slug: 'confluence',     color: '172b4d' },
  { name: 'IBM',          slug: 'ibm',            color: '006699' },
  { name: 'Jenkins',      slug: 'jenkins',        color: 'd33833' },
  { name: 'GitHub',       slug: 'github',         color: 'ffffff' },
  { name: 'GitLab',       slug: 'gitlab',         color: 'fc6d26' },
  { name: 'Python',       slug: 'python',         color: '3776ab' },
  { name: 'MATLAB',       slug: 'mathworks',      color: 'e16737' },
  { name: 'Docker',       slug: 'docker',         color: '2496ed' },
  { name: 'Kubernetes',   slug: 'kubernetes',     color: '326ce5' },
  { name: 'Bitbucket',    slug: 'bitbucket',      color: '2684ff' },
  { name: 'Siemens',      slug: 'siemens',        color: '009999' },
  { name: 'Autodesk',     slug: 'autodesk',       color: 'ffffff' },
  { name: 'Dassault Systèmes', slug: 'dassaultsystemes', color: '005386' },
]

const TEXT_LOGOS = [
  { name: 'PTC Codebeamer', color: '#e63946', bg: 'rgba(230,57,70,0.1)' },
  { name: 'IBM DOORS Next', color: '#0066b2', bg: 'rgba(0,102,178,0.1)' },
  { name: 'Polarion ALM',   color: '#00a0c8', bg: 'rgba(0,160,200,0.1)' },
  { name: 'Jama Connect',   color: '#e85d04', bg: 'rgba(232,93,4,0.1)' },
  { name: 'Perforce Helix', color: '#7b2d8b', bg: 'rgba(123,45,139,0.1)' },
  { name: 'Visure',         color: '#1a7f37', bg: 'rgba(26,127,55,0.1)' },
  { name: 'Trace.Space',    color: '#d4a017', bg: 'rgba(212,160,23,0.1)' },
  { name: 'Ansys Medini',   color: '#ffb100', bg: 'rgba(255,177,0,0.1)' },
]

const ALL = [
  ...LOGOS.map(l => ({ type: 'svg' as const, ...l })),
  ...TEXT_LOGOS.map(l => ({ type: 'text' as const, ...l })),
]

const DOUBLED = [...ALL, ...ALL]

export default function LogoCarousel() {
  return (
    <div className="w-full">
      <p className="text-center font-mono text-[10px] text-[#4b5563] uppercase tracking-widest mb-6">
        Integrates with your engineering stack
      </p>
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="logos-track">
          {DOUBLED.map((l, i) => (
            <div key={i} className="flex items-center gap-3 px-7 py-3 group">
              {l.type === 'svg' ? (
                <>
                  <img
                    src={`https://cdn.simpleicons.org/${l.slug}/${l.color}`}
                    alt={l.name}
                    className="h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <span className="font-display font-600 text-sm text-[#8892a4] whitespace-nowrap group-hover:text-white transition-colors">
                    {l.name}
                  </span>
                </>
              ) : (
                <div
                  className="font-display font-700 text-sm whitespace-nowrap px-3 py-1.5 rounded border opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ color: l.color, background: l.bg, borderColor: `${l.color}40` }}
                >
                  {l.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
