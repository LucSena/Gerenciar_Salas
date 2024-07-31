'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaCalendarAlt, FaChartBar, FaChartPie, FaCalendarCheck, FaUserFriends, FaDoorOpen, FaBell } from 'react-icons/fa';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Room {
  id: number;
  name: string;
  capacity: number;
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

interface DashboardData {
  rooms: Room[];
  stats: {
    totalReservations: number;
    activeUsers: number;
    totalRooms: number;
  };
  reservationDates: Date[]; // Adicione esta linha
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reservationDates, setReservationDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const isDateBooked = (date: Date, rooms: Room[]): boolean => {
    return rooms.some(room =>
      room.reservations.some(reservation => {
        const reservationDate = new Date(reservation.startTime);
        return reservationDate.toDateString() === date.toDateString();
      })
    );
  };
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data: DashboardData = await response.json();
        setDashboardData(data);
        // Extrair todas as datas de reserva
        const allReservationDates = data.rooms.flatMap(room =>
          room.reservations.map(reservation => new Date(reservation.startTime))
        );
        setReservationDates(allReservationDates);
      } else {
        console.error('Erro ao buscar dados do dashboard');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!dashboardData) {
    return <div>Erro ao carregar dados do dashboard.</div>;
  }

  const { rooms, stats } = dashboardData;

  // Prepare chart data

  const chartData = rooms.map(room => ({
    name: room.name,
    reservas: room.reservations.length
  }));

  // Prepare notifications
  const notifications = rooms.flatMap(room => 
    room.reservations.slice(0, 3).map(reservation => ({
      id: reservation.id,
      message: `Reserva para ${room.name} por ${reservation.user.name}`,
      time: new Date(reservation.startTime).toLocaleString()
    }))
  ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pieChartData = rooms.map((room, index) => ({
    name: room.name,
    value: room.reservations.length,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Bem-vindo, {session?.user.name}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <FaCalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReservations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <FaUserFriends className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas Disponíveis</CardTitle>
              <FaDoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações</CardTitle>
              <FaBell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaChartBar className="mr-2" />
                Visão Geral de Reservas por Sala
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
                  <TabsTrigger value="pie">Gráfico de Pizza</TabsTrigger>
                </TabsList>
                <TabsContent value="bar">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reservas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="pie">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="col-span-1 row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                Calendário de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
                modifiers={{
                  booked: (date) => isDateBooked(date, rooms),
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
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Legenda:</h3>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-100 mr-2"></div>
                  <span>Dia com reservas</span>
                </div>
              </div>
              {date && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Reservas para {date.toLocaleDateString()}:</h3>
                  <ScrollArea className="h-40">
                    {rooms.flatMap(room =>
                      room.reservations
                        .filter(res => new Date(res.startTime).toDateString() === date.toDateString())
                        .map(res => (
                          <div key={res.id} className="mb-2">
                            <p className="font-medium">{room.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(res.startTime).toLocaleTimeString()} - {new Date(res.endTime).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                    ).length > 0 ? (
                      rooms.flatMap(room =>
                        room.reservations
                          .filter(res => new Date(res.startTime).toDateString() === date.toDateString())
                          .map(res => (
                            <div key={res.id} className="mb-2">
                              <p className="font-medium">{room.name}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(res.startTime).toLocaleTimeString()} - {new Date(res.endTime).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                      )
                    ) : (
                      <p className="text-gray-600">Não há reservas para este dia.</p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center mb-4 p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{notification.message.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {session?.user.accessLevel === 'admin' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Administração</CardTitle>
              <CardDescription>Opções disponíveis para administradores</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/rooms/create')}>Criar Nova Sala</Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Salas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Card key={room.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>Capacidade: {room.capacity}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p>Próxima reserva: {room.reservations[0] 
                        ? new Date(room.reservations[0].startTime).toLocaleString() 
                        : 'Nenhuma'}</p>
                      <p>Status: <Badge variant={room.reservations[0] ? "secondary" : "outline"}>
                        {room.reservations[0] ? 'Reservada' : 'Disponível'}
                      </Badge></p>
                    </CardContent>
                    <CardContent className="pt-0">
                      <Button onClick={() => router.push(`/rooms/${room.id}`)}>Ver Detalhes</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}