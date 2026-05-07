# NexusALM — alm.nexusfinlabs.com

ALM traceability landing with live APS CAD viewer.

## Setup local

```
cp .env.example .env.local
```

Edita .env.local con tus credenciales APS:

```
APS_CLIENT_ID=xxx
APS_CLIENT_SECRET=xxx
```

```
npm install
npm run dev
```

Abre http://localhost:3000

## Deploy Vercel

```
npx vercel --prod
```

O push a GitHub y conecta el repo en vercel.com.

Añade env vars en Vercel Dashboard:
- APS_CLIENT_ID
- APS_CLIENT_SECRET

## DNS — alm.nexusfinlabs.com

En IONOS (o Cloudflare si ya migraste):

```
CNAME  alm  cname.vercel-dns.com  TTL 300
```

En Vercel Dashboard → proyecto → Settings → Domains → Add: alm.nexusfinlabs.com

## Usar el viewer CAD

Necesitas un URN de un modelo traducido en APS. Flujo:

1. Sube el archivo a un bucket OSS de APS
2. Lanza job de traducción con Model Derivative API
3. El job devuelve un URN base64
4. Pégalo en el campo del viewer

Formatos soportados: STEP, CATIA V5/V6 (.CATPart, .CATProduct),
SOLIDWORKS (.sldprt), 3DXML, JT, OBJ, STL, IFC, DWG.

## Stack

- Next.js 14 App Router
- TypeScript + Tailwind CSS
- Autodesk APS Viewer v7 (CDN)
- Fuentes: Syne + DM Mono + DM Sans (Google Fonts)
