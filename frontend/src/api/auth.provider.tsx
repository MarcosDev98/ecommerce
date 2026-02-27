import { useState, ReactNode } from 'react';
import { AuthContext } from './auth.context';

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });
  
  
  const [isLoading] = useState<boolean>(false);

  const loginUser = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}