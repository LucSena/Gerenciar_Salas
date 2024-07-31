'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FaUserPlus } from 'react-icons/fa';
import { toast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada com sucesso. Você pode fazer login agora.",
          variant: "default",
        });
        router.push('/login');
      } else {
        const data = await response.json();
        toast({
          title: "Erro no registro",
          description: data.message || 'Ocorreu um erro durante o registro.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast({
        title: "Erro",
        description: 'Ocorreu um erro durante o registro. Tente novamente.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <FaUserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os campos abaixo para se registrar no Agendei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome e sobrenome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/login" className="text-primary hover:underline">
              Faça login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}