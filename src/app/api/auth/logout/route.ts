import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (session) {
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  }

  return NextResponse.json({ message: "No active session found" }, { status: 400 });
}