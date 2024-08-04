import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextAuthSessionProvider from '@/components/providers/SessionProvider'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gerenciamento de Salas de Reunião',
  description: 'Sistema de reserva de salas de reunião',
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
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
          <AuthenticatedLayout>
            {children}
            <Toaster />
          </AuthenticatedLayout>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}