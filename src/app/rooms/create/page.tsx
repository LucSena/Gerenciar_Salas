'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface RoomFormData {
  name: string;
  capacity: number;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const form = useForm<RoomFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/rooms');
      } else {
        // Tratar erro
        console.error('Erro ao criar sala');
        // Você pode adicionar uma notificação de erro aqui
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      // Você pode adicionar uma notificação de erro aqui
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Sala</CardTitle>
          <CardDescription>Preencha os detalhes da nova sala</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Sala</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da sala" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que será exibido para a sala.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Digite a capacidade da sala" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de pessoas que a sala pode acomodar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Sala'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}