'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Room {
  id: string;
  name: string;
  capacity: number;
}

export default function RoomDetailsPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchRoom = async () => {
      if (id) {
        const response = await fetch(`/api/rooms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        }
      }
    };
    fetchRoom();
  }, [id]);

  const handleDelete = async () => {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      router.push('/rooms');
    }
  };

  if (!room) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
          <CardDescription>Detalhes da sala</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Capacidade: {room.capacity}</p>
          {/* Adicione mais detalhes da sala conforme necessário */}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/rooms')}>Voltar</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Excluir Sala</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tem certeza que deseja excluir esta sala?</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={handleDelete}>Confirmar Exclusão</Button>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}