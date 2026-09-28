import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AUTH_USER_KEY = 'minimalist_todo_current_user_v1';
const AUTH_TOKEN_KEY = 'minimalist_todo_auth_token_v1';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored) as User;
    } catch (e) {
      console.warn('Failed to parse current user', e);
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

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: emailInput.trim().toLowerCase(),
        password: passwordInput.trim(),
      });
      if (sbError || !data.session || !data.user) {
        throw new Error(sbError?.message || 'Invalid email or password.');
      }
      const userObj: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at).getTime(),
      };
      localStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      setToken(data.session.access_token);
      setCurrentUser(userObj);
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
    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email: emailInput.trim().toLowerCase(),
        password: passwordInput.trim(),
        options: {
          data: { name: nameInput.trim() },
        },
      });
      if (sbError || !data.user) {
        throw new Error(sbError?.message || 'Account creation failed.');
      }
      // Automatically sign in after signup
      return await login(emailInput, passwordInput);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
      setIsLoading(false);
      return false;
    }
  }, [login]);

  const loginAsDemo = useCallback(async () => {
    // Fallback demo user sign-in or auto fill
    await login('alex.rivera@minimalist.io', 'Password123!');
  }, [login]);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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
