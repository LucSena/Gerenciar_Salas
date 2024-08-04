import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(session.user.id) } });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar a senha:', error);
        return NextResponse.json({ error: 'Erro ao alterar a senha' }, { status: 500 });
    }
}