'use client'

const LOGOS = [
  { name: 'Jira',         slug: 'jira',             color: '0052cc' },
  { name: 'Confluence',   slug: 'confluence',       color: '2684ff' },
  { name: 'Jenkins',      slug: 'jenkins',          color: 'd33833' },
  { name: 'GitHub',       slug: 'github',           color: 'ffffff' },
  { name: 'GitLab',       slug: 'gitlab',           color: 'fc6d26' },
  { name: 'Python',       slug: 'python',           color: 'ffd43b' },
  { name: 'Docker',       slug: 'docker',           color: '2496ed' },
  { name: 'Bitbucket',    slug: 'bitbucket',        color: '2684ff' },
  { name: 'Siemens',      slug: 'siemens',          color: '00a0c8' },
  { name: 'Autodesk',     slug: 'autodesk',         color: 'ffffff' },
  { name: 'Dassault',     slug: 'dassaultsystemes', color: '0093d0' },
  { name: 'Mathematica',  slug: 'wolframmathematica', color: 'dd1100' },
]

const DOUBLED = [...LOGOS, ...LOGOS]

export default function LogoCarousel() {
  return (
    <div className="w-full">
      <p className="text-center font-mono text-[10px] text-[#8892a4] uppercase tracking-widest mb-8">
        Integrates with your engineering & simulation stack
      </p>
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#070709] to-transparent z-10 pointer-events-none" />
        <div className="logos-track">
          {DOUBLED.map((l, i) => (
            <div key={i} className="flex items-center gap-4 px-10 py-4">
              <img src={`https://cdn.simpleicons.org/${l.slug}/${l.color}`}
                alt={l.name} className="h-12 w-12" loading="lazy" />
              <span className="font-display font-700 text-lg text-white whitespace-nowrap">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
