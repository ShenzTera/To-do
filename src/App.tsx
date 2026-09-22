import { useState, useMemo } from 'react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Calendar, 
  RotateCcw, 
  ArrowUpDown,
  ListTodo
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { Task, FilterStatus } from './types';
import { LiquidBackground } from './components/LiquidBackground';
import { ThemeToggle } from './components/ThemeToggle';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { TaskFilters } from './components/TaskFilters';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileBadge } from './components/UserProfileBadge';

export default function App() {
  const { theme, setTheme, isDark } = useTheme();
  const {
    currentUser,
    token,
    isLoading: authLoading,
    error: authError,
    login,
    signup,
    logout,
    loginAsDemo,
    clearError,
  } = useAuth();

  const {
    tasks,
    isSyncing,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    clearCompleted,
    resetToSample,
  } = useTasks(currentUser?.id, token);

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Formatted current date
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = task.text.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        return matchesText || matchesCategory;
      }

      return true;
    });
  }, [tasks, filter, searchQuery]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handler for reordering when dragging in filtered view
  const handleReorder = (newOrder: Task[]) => {
    if (filter === 'all' && !searchQuery) {
      reorderTasks(newOrder);
    } else {
      // If reordering within a filtered subset, preserve non-visible tasks in their relative positions
      const visibleIds = new Set(newOrder.map((t) => t.id));
      const result: Task[] = [];
      let newOrderIndex = 0;

      for (const t of tasks) {
        if (visibleIds.has(t.id)) {
          result.push(newOrder[newOrderIndex]);
          newOrderIndex++;
        } else {
          result.push(t);
        }
      }
      reorderTasks(result);
    }
  };

  // If user is not authenticated, display the Liquid Glass Authentication Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center">
        <LiquidBackground />
        <AuthScreen
          onLogin={login}
          onSignup={signup}
          onDemoLogin={loginAsDemo}
          isLoading={authLoading}
          error={authError}
          clearError={clearError}
          theme={theme}
          setTheme={setTheme}
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between py-6 sm:py-12 px-4 sm:px-6">
      {/* Dynamic Ambient Liquid Mesh */}
      <LiquidBackground />

      {/* Main Single-Screen Centered Container */}
      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* App Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 dark:bg-indigo-400/10 border border-indigo-600/25 dark:border-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shadow-xs">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-heading">
                  Todo List
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  {todayFormatted}
                </p>
              </div>
            </div>

            {/* Profile & Dark Mode / Theme Toggle */}
            <div className="flex items-center gap-2">
              <UserProfileBadge user={currentUser} onLogout={logout} />
              <ThemeToggle theme={theme} setTheme={setTheme} isDark={isDark} />
            </div>
          </div>

          {/* Progress Bar with Liquid Glow */}
          {totalCount > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl glass-panel">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Task Completion
                </span>
                <span className="text-indigo-700 dark:text-indigo-400 font-bold">
                  {completedCount} of {totalCount} completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                />
              </div>
            </div>
          )}
        </header>

        {/* Task Input Section */}
        <section className="mb-6">
          <TaskInput onAddTask={addTask} />
        </section>

        {/* Task Filters & Tools */}
        <section className="mb-4">
          <TaskFilters
            filter={filter}
            onFilterChange={setFilter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </section>

        {/* Task List / Drag-and-Drop Container */}
        <section className="flex-1">
          {filteredTasks.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  Drag handle to reorder
                </span>
                <span>Double click to edit</span>
              </div>

              <Reorder.Group
                axis="y"
                values={filteredTasks}
                onReorder={handleReorder}
                className="space-y-2 relative"
              >
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onEdit={editTask}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center my-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 border border-indigo-600/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3">
                {filter === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mb-1">
                {searchQuery
                  ? 'No matching tasks found'
                  : filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All tasks completed!'
                  : 'Your list is clear'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-4 font-medium">
                {searchQuery
                  ? `No tasks matched "${searchQuery}". Try a different keyword.`
                  : filter === 'completed'
                  ? 'Completed tasks will appear here once you check them off.'
                  : filter === 'active'
                  ? 'Great job! You have no active tasks pending.'
                  : 'Add a new task above or load sample tasks to get started.'}
              </p>
              {tasks.length === 0 && (
                <button
                  type="button"
                  id="reset-sample-tasks-btn"
                  onClick={resetToSample}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Sample Tasks
                </button>
              )}
            </div>
          )}
        </section>

        {/* Minimal Footer */}
        <footer className="mt-8 pt-4 border-t border-slate-300/60 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>{isSyncing ? 'Syncing with Supabase...' : 'Supabase Cloud Synced'}</span>
          </span>
          <div className="flex items-center gap-3">
            {tasks.length > 0 && (
              <button
                id="footer-reset-sample-btn"
                onClick={resetToSample}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer underline-offset-2 hover:underline"
                title="Reset to default sample tasks in Supabase"
              >
                Reset sample tasks
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
