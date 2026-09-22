import { motion } from 'motion/react';
import { FilterStatus } from '../types';
import { CheckCheck, Trash2, Search, X } from 'lucide-react';

interface TaskFiltersProps {
  filter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TaskFilters({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
  searchQuery,
  onSearchChange,
}: TaskFiltersProps) {
  const filterOptions: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div id="task-filter-bar" className="space-y-3">
      {/* Top Bar: Search and Status Count */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-hidden ring-1 ring-transparent focus:ring-indigo-500/40 transition-all font-normal"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-700 dark:text-slate-300 px-1 font-medium">
          <span id="task-active-count">
            <span className="text-indigo-700 dark:text-indigo-400 font-bold">{activeCount}</span>{' '}
            {activeCount === 1 ? 'task' : 'tasks'} remaining
          </span>

          {completedCount > 0 && (
            <button
              id="clear-completed-btn"
              onClick={onClearCompleted}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer text-xs underline-offset-2 hover:underline font-medium"
              title="Remove all completed tasks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear completed ({completedCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Pill */}
      <div className="flex items-center justify-center p-1 rounded-xl glass-pill relative shadow-xs">
        {filterOptions.map((opt) => {
          const isActive = filter === opt.id;
          return (
            <button
              key={opt.id}
              id={`filter-tab-${opt.id}`}
              onClick={() => onFilterChange(opt.id)}
              className={`relative z-10 flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer text-center ${
                isActive
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
              {isActive && (
                <motion.div
                  layoutId="filter-active-pill"
                  className="absolute inset-0 rounded-lg bg-white dark:bg-slate-800 shadow-xs backdrop-blur-md border border-slate-300/80 dark:border-slate-700/60 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
