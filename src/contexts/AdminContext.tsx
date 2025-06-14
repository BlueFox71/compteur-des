import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    // Récupérer l'état admin depuis localStorage au démarrage
    const saved = localStorage.getItem('isAdmin');
    return saved === 'true';
  });

  const setIsAdminWithPersist = (value: boolean) => {
    setIsAdmin(value);
    // Sauvegarder l'état dans localStorage
    localStorage.setItem('isAdmin', value.toString());
  };

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin: setIsAdminWithPersist }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 