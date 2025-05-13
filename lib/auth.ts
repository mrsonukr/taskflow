import { User } from '@/context/UserContext';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

interface DecodedToken {
  exp: number;
  userId: string;
}

export const auth = {
  setSession(token: string, user: Omit<User, 'password'>) {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Also set in cookie for middleware
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; samesite=strict`;
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): Omit<User, 'password'> | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isValidToken(token: string): boolean {
    if (!token) return false;
    
    // For mock tokens, always return true
    if (token.startsWith('mock_jwt_token_')) return true;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isValidToken(token);
  }
};