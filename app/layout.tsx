import type { Metadata } from 'next'
import { Syne, DM_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'NexusALM — Requirement Traceability Intelligence',
  description: 'End-to-end ALM traceability for automotive, aerospace and medical devices. ISO 26262, ASPICE, IEC 61508 compliant.',
  openGraph: {
    title: 'NexusALM',
    description: 'Requirement Traceability Intelligence by NexusFinLabs',
    url: 'https://alm.nexusfinlabs.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body className="bg-[#070709] text-white antialiased font-body">{children}</body>
    </html>
  )
}
