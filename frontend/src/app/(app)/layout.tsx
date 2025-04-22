'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../../components/layout/MainLayout';
import { selectIsAuthenticated, setCredentials, clearAuth } from '../../store/slices/authSlice';
import { secureStorage } from '../../utils/storageUtils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Hidratación del estado de autenticación desde storage
  useEffect(() => {
    const { token, refreshToken, userData, rememberMe } = secureStorage.getAuthData();
    if (token && refreshToken && userData) {
      dispatch(setCredentials({ user: userData, token, refreshToken, rememberMe }));
    }
  }, [dispatch]);

  // Sincronizar logout entre ventanas/pestañas
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      // Si se eliminó el token, refresh o user_data en cualquier storage, cerrar sesión
      if (
        (event.key === 'erp_auth_token' || event.key === 'erp_refresh_token' || event.key === 'erp_user_data' || event.key === 'erp_remember_me')
        && (event.newValue === null)
      ) {
        dispatch(clearAuth());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);

  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }
  return <MainLayout>{children}</MainLayout>;
}

