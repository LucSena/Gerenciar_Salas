import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const rooms = await prisma.room.findMany({
      include: {
        reservations: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          where: {
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    // Calcular estatísticas
    const totalReservations = rooms.reduce((sum, room) => sum + room.reservations.length, 0);
    const activeUsers = await prisma.user.count({
      where: {
        reservations: {
          some: {
            startTime: {
              gte: new Date()
            }
          }
        }
      }
    });

    return NextResponse.json({
      rooms,
      stats: {
        totalReservations,
        activeUsers,
        totalRooms: rooms.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}