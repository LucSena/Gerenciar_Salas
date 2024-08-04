'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da sala deve ter pelo menos 2 caracteres.",
  }),
  capacity: z.number().min(1, {
    message: "A capacidade deve ser de pelo menos 1 pessoa.",
  }),
  location: z.string().min(2, {
    message: "A localização deve ter pelo menos 2 caracteres.",
  }),
});

export default function CreateRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: 1,
      location: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Sala criada com sucesso!",
          variant: "default",
        });
        router.push('/rooms');
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao criar sala",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar sala. Por favor, tente novamente.",
        variant: "destructive",
      });
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
                      <Input 
                        type="number" 
                        placeholder="Digite a capacidade da sala" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Número máximo de pessoas que a sala pode acomodar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite a localização da sala" {...field} />
                    </FormControl>
                    <FormDescription>
                      Informe onde a sala está localizada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Criando...' : 'Criar Sala'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}