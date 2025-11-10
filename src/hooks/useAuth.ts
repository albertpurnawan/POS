import { useState } from 'react';
import { apiPost } from '../lib/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiPost<{ user: User; token: string }>(
        '/auth/login',
        { email, password }
      );
      setUser(res.user);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    showRegister,
    setShowRegister,
    register: async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await apiPost<{ user: User; token: string }>(
          '/auth/register',
          { name, email, password }
        );
        setUser(res.user);
        return true;
      } catch (e) {
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  };
};
