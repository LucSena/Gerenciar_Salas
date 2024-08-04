import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(params.id) },
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
          orderBy: {
            startTime: 'asc'
          }
        }
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Erro ao buscar detalhes da sala:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.accessLevel !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const room = await prisma.room.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.accessLevel !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, capacity, location } = body;

    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        capacity,
        location,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    console.log('Session not found or user ID missing:', session);
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { startTime, endTime } = body;

    console.log('Received data:', { startTime, endTime, roomId: params.id, userId: session.user.id });

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Verificar se já existe uma reserva para o horário solicitado
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        roomId: parseInt(params.id),
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } },
            ],
          },
        ],
      },
    });

    if (existingReservation) {
      return NextResponse.json({ error: 'Horário já reservado' }, { status: 409 });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        roomId: parseInt(params.id),
        userId: parseInt(session.user.id),
        startTime: startDateTime,
        endTime: endDateTime,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    console.log('New reservation created:', newReservation);

    return NextResponse.json(newReservation);
  } catch (error: unknown) {
    console.error('Erro ao criar reserva:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno do servidor', details: errorMessage }, { status: 500 });
  }
}