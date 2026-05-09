import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Disaster Guard AI',
  description: 'Real-time AI-powered disaster alert system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}