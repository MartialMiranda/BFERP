'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import MainLayout from '../../components/layout/MainLayout';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // No renderizar nada hasta verificar la autenticación
  if (!isAuthenticated) {
    return null;
  }
  
  // Renderizar layout principal con el contenido
  return <MainLayout>{children}</MainLayout>;
}
