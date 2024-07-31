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
      include: { reservations: true },
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