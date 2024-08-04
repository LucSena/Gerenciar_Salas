import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, email } = await req.json();

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true,
                accessLevel: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
        return NextResponse.json({ error: 'Erro ao atualizar o perfil' }, { status: 500 });
    }
}