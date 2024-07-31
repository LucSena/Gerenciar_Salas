'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Room } from '@prisma/client';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchRooms();
    }
  }, [status, router]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data: Room[] = await response.json();
        setRooms(data);
      } else {
        console.error('Erro ao buscar salas');
      }
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {session?.user.accessLevel === 'admin' && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Administração</CardTitle>
            <CardDescription>Opções disponíveis para administradores</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/rooms/create')}>Criar Nova Sala</Button>
          </CardContent>
        </Card>
      )}

      {rooms.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhuma sala disponível</AlertTitle>
          <AlertDescription>
            {session?.user.accessLevel === 'admin' 
              ? "Não há salas cadastradas. Clique em 'Criar Nova Sala' para adicionar uma."
              : "Não há salas disponíveis no momento. Por favor, tente novamente mais tarde."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>Capacidade: {room.capacity}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/rooms/${room.id}`)}>Ver Detalhes</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}