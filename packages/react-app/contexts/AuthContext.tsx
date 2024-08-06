import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3 } from './useWeb3';
import { type User } from '@prisma/client';
import { trpc } from '../utils/trpc';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, user: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, getUserAddress } = useWeb3();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const userQuery = trpc.user.getUser.useQuery(undefined, {
    enabled: !!address,
  });

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    console.log("use Auth")
    if (address && userQuery.data) {
      setIsAuthenticated(true);
      setUser({
        ...userQuery.data,
        createdAt: new Date(userQuery.data.createdAt),
        updatedAt: new Date(userQuery.data.updatedAt)
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [address, userQuery.data]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);