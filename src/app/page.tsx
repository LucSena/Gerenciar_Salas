'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCalendarAlt, FaDoorOpen, FaUserFriends, FaLock } from 'react-icons/fa';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const features = [
    { icon: FaCalendarAlt, title: "Reserva de Salas", description: "Visualize a disponibilidade e faça reservas facilmente" },
    { icon: FaDoorOpen, title: "Gerenciamento de Salas", description: "Crie, atualize e exclua salas de reunião (admin)" },
    { icon: FaUserFriends, title: "Níveis de Acesso", description: "Administradores e usuários comuns" },
    { icon: FaLock, title: "Segurança", description: "Autenticação robusta e proteção contra SQL Injection" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-blue-800">Agendei</h1>
          <p className="text-xl text-gray-600">Sistema de Reserva de Salas de Reunião</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-blue-700">Simplifique o agendamento de suas reuniões</h2>
            <p className="text-lg text-gray-700 mb-8">
              O Agendei oferece uma solução intuitiva para gerenciar salas de reunião,
              permitindo que sua equipe foque no que realmente importa: colaboração eficaz.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Registrar</Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="https://i.pinimg.com/originals/8c/ac/21/8cac2121cf5252152c566fad392a917b.jpg" alt="Sala de Reunião" className="rounded-lg shadow-xl" />
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center text-blue-800">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="mx-auto text-4xl text-blue-600 mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center text-blue-800">Tecnologias Utilizadas</h2>
          <div className="flex justify-center space-x-8">
            {['Next.js', 'TailwindCSS', 'Prisma', 'ShadcnUI'].map((tech, index) => (
              <Card key={index} className="w-40 text-center">
                <CardContent className="pt-6">
                  <p className="font-semibold">{tech}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="text-center text-gray-600">
          <p className="mb-4">&copy; 2024 Agendei - Sistema de Gerenciamento de Salas. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-4">
            <a href="https://linkedin.com/in/lucas-de-sena" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              <FaLinkedin size={24} />
            </a>
            <a href="https://github.com/LucSena" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-600">
              <FaGithub size={24} />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}