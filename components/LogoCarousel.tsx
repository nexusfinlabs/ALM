'use client'

const LOGOS = [
  { name: 'Jira',         slug: 'jira',           color: '0052cc' },
  { name: 'Confluence',   slug: 'confluence',     color: '2684ff' },
  { name: 'IBM',          slug: 'ibm',            color: '0066cc' },
  { name: 'Jenkins',      slug: 'jenkins',        color: 'd33833' },
  { name: 'GitHub',       slug: 'github',         color: 'ffffff' },
  { name: 'GitLab',       slug: 'gitlab',         color: 'fc6d26' },
  { name: 'Python',       slug: 'python',         color: 'ffd43b' },
  { name: 'Docker',       slug: 'docker',         color: '2496ed' },
  { name: 'Kubernetes',   slug: 'kubernetes',     color: '326ce5' },
  { name: 'Bitbucket',    slug: 'bitbucket',      color: '2684ff' },
  { name: 'Siemens',      slug: 'siemens',        color: '00a0c8' },
  { name: 'Autodesk',     slug: 'autodesk',       color: 'ffffff' },
  { name: 'Dassault',     slug: 'dassaultsystemes', color: '0093d0' },
]

const TEXT_LOGOS = [
  { name: 'PTC Codebeamer', color: '#ff4757' },
  { name: 'IBM DOORS Next', color: '#3b82f6' },
  { name: 'Polarion ALM',   color: '#06b6d4' },
  { name: 'Jama Connect',   color: '#fb923c' },
  { name: 'Perforce Helix', color: '#a855f7' },
  { name: 'Visure',         color: '#22c55e' },
  { name: 'Trace.Space',    color: '#fbbf24' },
  { name: 'Ansys Medini',   color: '#ffb100' },
]

const ALL = [
  ...LOGOS.map(l => ({ type: 'svg' as const, ...l })),
  ...TEXT_LOGOS.map(l => ({ type: 'text' as const, ...l })),
]
const DOUBLED = [...ALL, ...ALL]

export default function LogoCarousel() {
  return (
    <div className="w-full">
      <p className="text-center font-mono text-[10px] text-[#8892a4] uppercase tracking-widest mb-8">
        Integrates with your engineering stack
      </p>
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="logos-track">
          {DOUBLED.map((l, i) => (
            <div key={i} className="flex items-center gap-4 px-10 py-4">
              {l.type === 'svg' ? (
                <>
                  <img
                    src={`https://cdn.simpleicons.org/${l.slug}/${l.color}`}
                    alt={l.name}
                    className="h-12 w-12"
                    loading="lazy"
                  />
                  <span className="font-display font-700 text-lg text-white whitespace-nowrap">
                    {l.name}
                  </span>
                </>
              ) : (
                <div
                  className="font-display font-700 text-lg whitespace-nowrap px-4 py-2 rounded-lg border-2"
                  style={{ color: l.color, borderColor: l.color, background: `${l.color}15` }}
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
