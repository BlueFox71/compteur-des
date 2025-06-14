import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdmin } from '../contexts/AdminContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/statistiques', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
} 