import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/api/auth.context';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando sesión...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>;
}