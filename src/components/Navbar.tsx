'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaCalendarAlt, FaDoorOpen, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { MdDashboard, MdSettings } from 'react-icons/md';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { data: session } = useSession();
  
    if (!session) {
      return null;
    }  

    const NavItem = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => {
        const isActive = pathname === href;
        return (
            <Link href={href} passHref>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`relative ${isActive ? 'font-bold' : ''}`}
                >
                    <Icon className="mr-2 h-4 w-4" />
                    {children}
                    {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </Button>
            </Link>
        );
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await signOut({ redirect: false });
            router.push('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-background border-b">
            <div className="flex items-center space-x-2">
                <FaCalendarAlt className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">Agendei</span>
            </div>

            <div className="flex space-x-1">
                <NavItem href="/dashboard" icon={MdDashboard}>
                    Dashboard
                </NavItem>
                <NavItem href="/rooms" icon={FaDoorOpen}>
                    Salas
                </NavItem>
                {session.user.accessLevel === 'admin' && (
                    <NavItem href="/admin" icon={MdSettings}>
                        Admin
                    </NavItem>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                            <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <FaUser className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                        <FaSignOutAlt className="mr-2 h-4 w-4" />
                        <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
};