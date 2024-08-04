'use client';

import { User } from "@prisma/client";
import { useSession } from 'next-auth/react';

'lista de imports shadcnUI';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";





export default function ProfilePage() {
    const { data: session, status } = useSession();
    return (
        <div>
            <h1>Perfil</h1>
            <p>Olá, {session?.user?.name}!</p>
            <p>Email: {session?.user?.email}</p>
            <p>Nível de acesso: {session?.user?.accessLevel}</p>
            <Button>Editar perfil</Button>
            <Button>Alterar senha</Button>
        </div>
    );
}


