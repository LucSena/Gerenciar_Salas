'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setEmail(session.user.email || '');
        }
    }, [session]);

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                
                // Atualiza a sessão com os novos dados
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: updatedUser.name,
                        email: updatedUser.email
                    }
                });

                setIsEditing(false);
                toast({
                    title: "Perfil atualizado",
                    description: "Suas informações foram atualizadas com sucesso.",
                });
            } else {
                throw new Error('Falha ao atualizar o perfil');
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao atualizar o perfil. Tente novamente.",
                variant: "destructive",
            });
        }
    };


    const handleChangePassword = async () => {
        try {
            const response = await fetch('/api/profile/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: password, newPassword }),
            });

            if (response.ok) {
                setPassword('');
                setNewPassword('');
                toast({
                    title: "Senha alterada",
                    description: "Sua senha foi alterada com sucesso.",
                });
            } else {
                throw new Error('Falha ao alterar a senha');
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao alterar a senha. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    if (status === "loading") {
        return <div>Carregando...</div>;
    }

    if (!session) {
        return <div>Acesso negado. Por favor, faça login.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={session.user.image || ''} />
                            <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{session.user.name}</CardTitle>
                            <CardDescription>{session.user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="info" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="info">Informações</TabsTrigger>
                            <TabsTrigger value="security">Segurança</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nível de acesso</Label>
                                    <p>{session.user.accessLevel}</p>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="security">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Senha atual</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nova senha</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleChangePassword}>Alterar senha</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {activeTab === 'info' && (
                        isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                <Button onClick={handleSave}>Salvar</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
                        )
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}