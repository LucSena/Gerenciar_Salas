'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { FaUserFriends, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  reservations: Reservation[];
}

interface Reservation {
  id: number;
  startTime: string;
  endTime: string;
  user: {
    name: string;
    email: string;
  };
}

export default function RoomDetailsPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  if (!room) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  const filteredReservations = room.reservations.filter(reservation => 
    new Date(reservation.startTime).toDateString() === selectedDate?.toDateString()
  );

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{room.name}</CardTitle>
          <CardDescription>Detalhes da sala</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <FaUserFriends className="mr-2 text-gray-500" />
              <span>Capacidade: {room.capacity}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-500" />
              <span>Localização: {room.location || 'Não especificada'}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <span>Total de reservas: {room.reservations.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReservations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horário</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        {format(new Date(reservation.startTime), 'HH:mm')} - 
                        {format(new Date(reservation.endTime), 'HH:mm')}
                      </TableCell>
                      <TableCell>{reservation.user.name}</TableCell>
                      <TableCell>
                        <Badge variant={new Date(reservation.startTime) > new Date() ? "outline" : "secondary"}>
                          {new Date(reservation.startTime) > new Date() ? 'Agendada' : 'Em andamento'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhuma reserva para esta data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button onClick={() => router.push('/rooms')}>Voltar</Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Excluir Sala</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tem certeza que deseja excluir esta sala?</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. Todas as reservas associadas a esta sala serão excluídas.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete}>Confirmar Exclusão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}