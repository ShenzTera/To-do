import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const AUTH_USER_KEY = 'minimalist_todo_current_user_v1';
const AUTH_TOKEN_KEY = 'minimalist_todo_auth_token_v1';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (e) {
      console.warn('Failed to parse current user from storage', e);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify session on mount if token is stored
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          setCurrentUser(null);
          setToken(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      setError('Please provide both email and password.');
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please verify your credentials.');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const signup = useCallback(async (nameInput: string, emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const name = nameInput.trim();
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!name || name.length < 2) {
      setError('Please enter a valid name (at least 2 characters).');
      setIsLoading(false);
      return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return false;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account creation failed.');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const loginAsDemo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo sign in failed.');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Demo sign in error.');
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Error clearing session', e);
    }
    setToken(null);
    setCurrentUser(null);
    setError(null);
  }, []);

  return {
    currentUser,
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    loginAsDemo,
    clearError: () => setError(null),
  };
}
