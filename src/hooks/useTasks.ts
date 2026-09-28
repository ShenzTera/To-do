import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Task, Category, Priority } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_KEY = 'minimalist_todo_tasks_v1';
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    text: 'Design liquid glass interface with subtle blur',
    completed: true,
    createdAt: Date.now() - 3600000 * 4,
    category: 'work',
    priority: 'high',
  },
  {
    id: '2',
    text: 'Implement fluid drag-and-drop task reordering',
    completed: true,
    createdAt: Date.now() - 3600000 * 2,
    category: 'work',
    priority: 'medium',
  },
];

export function useTasks(userId?: string | null, token?: string | null) {
  const storageKey = userId ? `minimalist_todo_tasks_${userId}` : STORAGE_KEY;
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load tasks', e);
    }
    return INITIAL_TASKS;
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch tasks from Supabase table directly
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    setIsSyncing(true);

    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (!error && data) {
          const mapped: Task[] = data.map((row: any) => ({
            id: row.id,
            text: row.text,
            completed: Boolean(row.completed),
            category: row.category || 'personal',
            priority: row.priority || 'medium',
            createdAt: new Date(row.created_at).getTime(),
          }));
          setTasks(mapped);
          localStorage.setItem(storageKey, JSON.stringify(mapped));
        }
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, storageKey]);

  const addTask = useCallback(
    async (text: string, category?: Category, priority?: Priority) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const tempId = crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        category: category || 'personal',
        priority: priority || 'medium',
      };
      setTasks((prev) => [optimisticTask, ...prev]);

      if (userId) {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            text: trimmed,
            completed: false,
            category: category || 'personal',
            priority: priority || 'medium',
          })
          .select();

        if (!error && data && data.length > 0) {
          const row = data[0];
          const savedTask: Task = {
            id: row.id,
            text: row.text,
            completed: Boolean(row.completed),
            category: row.category,
            priority: row.priority,
            createdAt: new Date(row.created_at).getTime(),
          };
          setTasks((prev) => prev.map((t) => (t.id === tempId ? savedTask : t)));
        }
      }
    },
    [userId]
  );

  const editTask = useCallback(
    async (id: string, newText: string, category?: Category, priority?: Priority) => {
      const trimmed = newText.trim();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                text: trimmed || task.text,
                category: category !== undefined ? category : task.category,
                priority: priority !== undefined ? priority : task.priority,
              }
            : task
        )
      );

      if (userId) {
        const updates: Record<string, any> = {};
        if (trimmed) updates.text = trimmed;
        if (category !== undefined) updates.category = category;
        if (priority !== undefined) updates.priority = priority;

        await supabase.from('tasks').update(updates).eq('id', id).eq('user_id', userId);
      }
    },
    [userId]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      let nextStatus = false;
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            nextStatus = !task.completed;
            return { ...task, completed: nextStatus };
          }
          return task;
        })
      );

      if (userId) {
        await supabase.from('tasks').update({ completed: nextStatus }).eq('id', id).eq('user_id', userId);
      }
    },
    [userId]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      if (userId) {
        await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
      }
    },
    [userId]
  );

  const reorderTasks = useCallback((newOrder: Task[]) => {
    setTasks(newOrder);
  }, []);

  const clearCompleted = useCallback(async () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    if (userId) {
      await supabase.from('tasks').delete().eq('user_id', userId).eq('completed', true);
    }
  }, [userId]);

  const resetToSample = useCallback(async () => {
    setTasks(INITIAL_TASKS);
  }, []);

  return {
    tasks,
    isSyncing,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    clearCompleted,
    resetToSample,
  };
}
