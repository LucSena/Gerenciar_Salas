import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.accessLevel !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name, capacity, location } = await request.json();

    const newRoom = await prisma.room.create({
      data: {
        name,
        capacity,
        location,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}