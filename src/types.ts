export type Priority = 'low' | 'medium' | 'high';

export type Category = 'personal' | 'work' | 'urgent' | 'daily';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  category?: Category;
  priority?: Priority;
  dueDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export type FilterStatus = 'all' | 'active' | 'completed';

export type ThemeMode = 'light' | 'dark' | 'system';
