'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { FaCalendarAlt, FaDoorOpen, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { data: session } = useSession();
  
    if (!session) {
      return null; // Não renderiza nada se não houver sessão
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
      router.push('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-background shadow-sm">
      <div className="flex items-center space-x-2">
        <FaCalendarAlt className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-primary">Agendei</span>
      </div>

      <div className="flex space-x-2">
        <NavItem href="/dashboard" icon={MdDashboard}>
          Dashboard
        </NavItem>
        <NavItem href="/rooms" icon={FaDoorOpen}>
          Salas
        </NavItem>
      </div>

      <Button 
        variant="outline" 
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <FaSignOutAlt className="mr-2 h-4 w-4" />
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </Button>
    </nav>
  );
};