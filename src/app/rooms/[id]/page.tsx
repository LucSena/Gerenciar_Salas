'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaUserFriends, FaCalendarAlt, FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRoom = async () => {
      if (id) {
        const response = await fetch(`/api/rooms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
          setEditedRoom(data);
        }
      }
    };
    fetchRoom();
  }, [id]);

  const isDateBooked = (date: Date, rooms: Room[]): boolean => {
    return rooms.some(room =>
      room.reservations.some(reservation => {
        const reservationDate = new Date(reservation.startTime);
        return reservationDate.toDateString() === date.toDateString();
      })
    );
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      router.push('/rooms');
    }
  };

  const handleEdit = async () => {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedRoom),
    });
    if (response.ok) {
      setRoom(await response.json());
      setIsEditDialogOpen(false);
    }
  };

  if (!room) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  const filteredReservations = room.reservations.filter(reservation => 
    new Date(reservation.startTime).toDateString() === selectedDate?.toDateString()
  );

  const isAdmin = session?.user?.accessLevel === 'admin';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">{room.name}</CardTitle>
              <CardDescription>Detalhes da sala</CardDescription>
            </div>
            {isAdmin && (
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <FaPencilAlt className="mr-2" /> Editar
              </Button>
            )}
          </div>
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
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
                modifiers={{
                  booked: (date) => isDateBooked(date, [room])
                }}
                modifiersStyles={{
                  booked: { backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', fontWeight: 'bold' }
                }}
                styles={{
                  months: { width: '100%' },
                  month: { width: '100%' },
                  table: { width: '100%' },
                  head_cell: { 
                    width: 'calc(100% / 7)',
                    textAlign: 'center',
                    padding: '0.5rem',
                    fontSize: '0.875rem'
                  },
                  cell: { 
                    width: 'calc(100% / 7)',
                    height: '2.5rem',
                    textAlign: 'center',
                    padding: '0.25rem'
                  },
                  day: { 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  },
                  nav_button: {
                    width: '2rem',
                    height: '2rem'
                  }
                }}
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
              <p className="text-center text-gray-500">Nenhuma reserva para esta data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button onClick={() => router.push('/rooms')}>Voltar</Button>
          {isAdmin && (
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
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Sala</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={editedRoom.name}
                  onChange={(e) => setEditedRoom({ ...editedRoom, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacidade
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={editedRoom.capacity}
                  onChange={(e) => setEditedRoom({ ...editedRoom, capacity: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  id="location"
                  value={editedRoom.location}
                  onChange={(e) => setEditedRoom({ ...editedRoom, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}