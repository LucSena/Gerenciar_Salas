import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const users = await prisma.user.findMany();
    const rooms = await prisma.room.findMany();
    const reservations = await prisma.reservation.findMany();

    return NextResponse.json({ users, rooms, reservations });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, accessLevel } = body;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, 
        accessLevel,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}