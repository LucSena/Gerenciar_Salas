import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextAuthSessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gerenciamento de Salas de Reunião',
  description: 'Sistema de reserva de salas de reunião',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}