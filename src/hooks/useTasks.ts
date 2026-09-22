import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Category, Priority } from '../types';

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
  {
    id: '3',
    text: 'Add dark mode toggle and local storage sync',
    completed: false,
    createdAt: Date.now() - 3600000,
    category: 'work',
    priority: 'high',
  },
  {
    id: '4',
    text: 'Prepare weekly project presentation slides',
    completed: false,
    createdAt: Date.now() - 1800000,
    category: 'personal',
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
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Fetch tasks from Supabase API when token is provided
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setIsSyncing(true);

    fetch('/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks from Supabase');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.tasks) {
          if (data.tasks.length === 0) {
            // First time user: seed default sample tasks in Supabase
            fetch('/api/tasks/reset-sample', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((seedData) => {
                if (isMounted && seedData.tasks) {
                  setTasks(seedData.tasks);
                  localStorage.setItem(storageKey, JSON.stringify(seedData.tasks));
                }
              })
              .catch(() => {});
          } else {
            setTasks(data.tasks);
            localStorage.setItem(storageKey, JSON.stringify(data.tasks));
          }
          setSyncError(null);
        }
      })
      .catch((err) => {
        console.warn('Supabase fetch error, using cached tasks:', err);
        if (isMounted) setSyncError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, storageKey]);

  // Persist to local cache
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to cache tasks in localStorage', e);
    }
  }, [tasks, storageKey]);

  const addTask = useCallback(
    async (text: string, category?: Category, priority?: Priority) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const tempId = crypto.randomUUID
        ? crypto.randomUUID()
        : `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimisticTask: Task = {
        id: tempId,
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        category: category || 'personal',
        priority: priority || 'medium',
      };

      setTasks((prev) => [optimisticTask, ...prev]);

      if (token) {
        try {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: trimmed,
              category: category || 'personal',
              priority: priority || 'medium',
            }),
          });
          const data = await res.json();
          if (res.ok && data.task) {
            setTasks((prev) =>
              prev.map((t) => (t.id === tempId ? data.task : t))
            );
          }
        } catch (err) {
          console.error('Failed to sync new task with Supabase:', err);
        }
      }
    },
    [token]
  );

  const editTask = useCallback(
    async (id: string, newText: string, category?: Category, priority?: Priority) => {
      const trimmed = newText.trim();
      if (!trimmed) return;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                text: trimmed,
                category: category !== undefined ? category : task.category,
                priority: priority !== undefined ? priority : task.priority,
              }
            : task
        )
      );

      if (token) {
        try {
          await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: trimmed,
              category,
              priority,
            }),
          });
        } catch (err) {
          console.error('Failed to sync edit with Supabase:', err);
        }
      }
    },
    [token]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      let updatedStatus = false;
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            updatedStatus = !task.completed;
            return { ...task, completed: updatedStatus };
          }
          return task;
        })
      );

      if (token) {
        try {
          await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              completed: updatedStatus,
            }),
          });
        } catch (err) {
          console.error('Failed to sync toggle with Supabase:', err);
        }
      }
    },
    [token]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));

      if (token) {
        try {
          await fetch(`/api/tasks/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error('Failed to sync delete with Supabase:', err);
        }
      }
    },
    [token]
  );

  const reorderTasks = useCallback((newOrder: Task[]) => {
    setTasks(newOrder);
  }, []);

  const clearCompleted = useCallback(async () => {
    setTasks((prev) => prev.filter((t) => !t.completed));

    if (token) {
      try {
        await fetch('/api/tasks/clear-completed', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Failed to sync clear-completed with Supabase:', err);
      }
    }
  }, [token]);

  const resetToSample = useCallback(async () => {
    if (token) {
      try {
        const res = await fetch('/api/tasks/reset-sample', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.tasks) {
          setTasks(data.tasks);
          return;
        }
      } catch (err) {
        console.error('Failed to reset sample in Supabase:', err);
      }
    }
    setTasks(INITIAL_TASKS);
  }, [token]);

  return {
    tasks,
    isSyncing,
    syncError,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    clearCompleted,
    resetToSample,
  };
}
