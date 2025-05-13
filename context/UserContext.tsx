"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export type User = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
};

type UserContextType = {
  currentUser: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, username: string, email: string, password: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = () => {
      const user = auth.getUser();
      if (user && auth.isAuthenticated()) {
        setCurrentUser(user as User);
      } else {
        auth.clearSession();
        setCurrentUser(null);
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch('https://task-backend-2tiy.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      const { user, token } = data;

      const authUser: User = {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
      };

      auth.setSession(token, authUser);
      setCurrentUser(authUser);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = () => {
    auth.clearSession();
    setCurrentUser(null);
    router.push('/');
  };

  const register = async (fullName: string, username: string, email: string, password: string) => {
    try {
      const response = await fetch('https://task-backend-2tiy.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { user, token } = data;

      const authUser: User = {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
      };

      auth.setSession(token, authUser);
      setCurrentUser(authUser);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    try {
      const token = auth.getToken();
      if (!token || !auth.isAuthenticated()) {
        return [];
      }

      const response = await fetch(`https://task-backend-2tiy.onrender.com/api/users/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search users');
      }

      const data = await response.json();
      // Handle both array and object with 'users' property
      const users: any[] = Array.isArray(data) ? data : data.users || [];

      // Map API response to User type and filter out invalid users
      return users
        .map((user): Partial<User> => ({
          id: user._id || user.id,
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'user',
          avatarUrl: user.avatarUrl || undefined,
        }))
        .filter((user): user is User =>
          !!user.id &&
          typeof user.fullName === 'string' &&
          typeof user.username === 'string' &&
          typeof user.email === 'string' &&
          (user.role === 'user' || user.role === 'admin') &&
          user.id !== currentUser?.id
        );
      // Ensure id exists and exclude current user
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        login,
        logout,
        register,
        searchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}