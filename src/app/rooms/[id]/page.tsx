'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { FaUserFriends, FaCalendarAlt, FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
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
  date: Date;
  user: {
    name: string;
    email: string;
  };
}
interface ReservationForm {
  date: Date;
  startTime: string;
  endTime: string;
}

export default function RoomDetailsPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ReservationForm>();
  const [isReserving, setIsReserving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        try {
          const response = await fetch(`/api/rooms/${id}`);
          if (response.ok) {
            const data = await response.json();
            setRoom(data);
            setEditedRoom(data);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da sala:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchRoom();
  }, [id]);
  


  const onSubmit = async (data: ReservationForm) => {
    setIsReserving(true);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`);

      const requestBody = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      console.log('Sending reservation request:', requestBody);

      const response = await fetch(`/api/rooms/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        const localStartTime = toZonedTime(new Date(responseData.startTime), timeZone);
        const localEndTime = toZonedTime(new Date(responseData.endTime), timeZone);

        setRoom(prevRoom => ({
          ...prevRoom!,
          reservations: [...prevRoom!.reservations, {
            ...responseData,
            startTime: localStartTime.toISOString(),
            endTime: localEndTime.toISOString(),
          }],
        }));
        toast({
          title: "Sucesso",
          description: "Reserva criada com sucesso!",
          variant: "default",
        })
      } else {
        console.error('Erro na resposta da API:', responseData);
        if (response.status === 409) {
          toast({
            title: "Erro",
            description: "Horário já reservado. Por favor, escolha outro horário.",
            variant: "destructive",
          })
        } else if (response.status === 401) {
          toast({
            title: "Erro",
            description: "Não autorizado. Por favor, faça login novamente.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erro",
            description: responseData.error || "Erro ao criar reserva. Por favor, tente novamente.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar reserva. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsReserving(false);
    }
  };
  
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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedRoom),
      });
      if (response.ok) {
        const updatedRoom = await response.json();
        // Garantir que updatedRoom tem todas as propriedades necessárias
        setRoom({
          ...room, // Manter as propriedades existentes
          ...updatedRoom, // Sobrescrever com as propriedades atualizadas
          reservations: room?.reservations || [] // Manter as reservas existentes se não forem atualizadas
        });
        setIsEditDialogOpen(false);
      } else {
        // Tratar erro de resposta não-OK
        console.error('Erro ao atualizar sala:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao editar sala:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  if (!room) return <div className="flex items-center justify-center h-screen">Sala não encontrada</div>;
  
  const filteredReservations = room && room.reservations
    ? room.reservations.filter(reservation => 
        new Date(reservation.startTime).toDateString() === date?.toDateString()
      )
    : [];
  
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

      <Card>
        <CardHeader>
          <CardTitle>Fazer Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Data é obrigatória' })}
              />
              {errors.date && <p className="text-red-500">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="startTime">Hora de Início</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime', { required: 'Hora de início é obrigatória' })}
              />
              {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}
            </div>
            <div>
              <Label htmlFor="endTime">Hora de Término</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime', { required: 'Hora de término é obrigatória' })}
              />
              {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}
            </div>
            <Button type="submit" disabled={isReserving}>
              {isReserving ? 'Reservando...' : 'Reservar'}
            </Button>
          </form>
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