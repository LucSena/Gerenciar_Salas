import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Gerenciamento de Salas de Reunião</h1>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="default">Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Registro</Button>
        </Link>
      </div>
    </main>
  )
}