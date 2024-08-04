'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaSearch, FaPlus, FaEye, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  reservations: {
    id: number;
    startTime: string;
    endTime: string;
  }[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(roomsData);
        setFilteredRooms(roomsData);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const results = rooms.filter(room =>
      (room.name?.toLowerCase().includes(searchTerm.toLowerCase()) || room.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (capacityFilter === 'all' || room.capacity >= parseInt(capacityFilter)) &&
      (locationFilter === 'all' || room.location === locationFilter)
    );
    setFilteredRooms(results);
  }, [searchTerm, capacityFilter, locationFilter, rooms]);

  const getNextReservation = (room: Room) => {
    const now = new Date();
    const futureReservations = room.reservations.filter(res => new Date(res.startTime) > now);
    return futureReservations.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  };

  const uniqueLocations = Array.from(new Set(rooms.map(room => room.location)));

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Gerenciamento de Salas</CardTitle>
          <CardDescription>Visualize e gerencie todas as salas disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Buscar salas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Capacidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="10">10+ pessoas</SelectItem>
                <SelectItem value="20">20+ pessoas</SelectItem>
                <SelectItem value="50">50+ pessoas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => router.push('/rooms/create')}>
              <FaPlus className="mr-2" /> Criar Nova Sala
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>{room.location}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center mb-2">
                <FaUserFriends className="mr-2 text-gray-500" />
                <span>Capacidade: {room.capacity}</span>
              </div>
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                <span>Localização: {room.location}</span>
              </div>
              <div className="mt-4">
                <Badge variant={getNextReservation(room) ? "secondary" : "outline"}>
                  {getNextReservation(room) ? 'Próxima Reserva' : 'Disponível'}
                </Badge>
                {getNextReservation(room) && (
                  <p className="text-sm mt-1">
                    {new Date(getNextReservation(room).startTime).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button variant="outline" onClick={() => router.push(`/rooms/${room.id}`)}>
                <FaEye className="mr-2" /> Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-10">
            <p className="text-xl font-semibold">Nenhuma sala encontrada</p>
            <p className="text-gray-500 mt-2">Tente ajustar seus critérios de busca ou crie uma nova sala.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}