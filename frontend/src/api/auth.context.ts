import { createContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (token: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);