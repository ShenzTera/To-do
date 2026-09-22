import { useState, useRef, useEffect } from 'react';
import { Plus, Tag, Flag, Sparkles } from 'lucide-react';
import { Category, Priority } from '../types';

interface TaskInputProps {
  onAddTask: (text: string, category?: Category, priority?: Priority) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    onAddTask(text, category, priority);
    setText('');
    setShowOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const categories: { id: Category; label: string; color: string }[] = [
    { id: 'personal', label: 'Personal', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40' },
    { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40' },
    { id: 'urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40' },
    { id: 'daily', label: 'Daily', color: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' },
  ];

  const priorities: { id: Priority; label: string; dotColor: string }[] = [
    { id: 'low', label: 'Low', dotColor: 'bg-slate-500' },
    { id: 'medium', label: 'Med', dotColor: 'bg-amber-600' },
    { id: 'high', label: 'High', dotColor: 'bg-rose-600' },
  ];

  return (
    <form
      id="task-input-form"
      onSubmit={handleSubmit}
      className="glass-panel rounded-2xl p-2.5 sm:p-3 transition-all duration-300 relative group shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            id="task-title-input"
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowOptions(true)}
            placeholder="What needs to be done today? (e.g. Finish quarterly review)"
            className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-hidden font-normal"
          />
        </div>

        <button
          type="button"
          id="task-toggle-options-btn"
          onClick={() => setShowOptions(!showOptions)}
          title="Toggle tags and priority options"
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            showOptions
              ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 font-medium'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          <Tag className="w-4 h-4" />
        </button>

        <button
          type="submit"
          id="task-add-submit-btn"
          disabled={!text.trim()}
          className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Expandable Options Tray */}
      {showOptions && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-700 dark:text-slate-300 mr-1 font-semibold">Tag:</span>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                id={`category-btn-${c.id}`}
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  category === c.id
                    ? `${c.color} ring-1 ring-offset-0 ring-current shadow-xs`
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-transparent dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-700 dark:text-slate-300 mr-1 font-semibold">Priority:</span>
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/5 p-1 rounded-lg border border-slate-300/50 dark:border-transparent">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  id={`priority-btn-${p.id}`}
                  onClick={() => setPriority(p.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                    priority === p.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dotColor}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
