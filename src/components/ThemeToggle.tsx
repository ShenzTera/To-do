import { Sun, Moon, Laptop } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

export function ThemeToggle({ theme, setTheme, isDark }: ThemeToggleProps) {
  const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div
      id="theme-toggle-container"
      className="inline-flex items-center p-1 rounded-full glass-pill relative shadow-sm"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {modes.map((item) => {
        const Icon = item.icon;
        const isActive = theme === item.id;

        return (
          <button
            key={item.id}
            id={`theme-btn-${item.id}`}
            onClick={() => setTheme(item.id)}
            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title={`${item.label} mode`}
            aria-checked={isActive}
            role="radio"
          >
            <Icon className="w-4 h-4" />
            {isActive && (
              <motion.div
                layoutId="theme-active-indicator"
                className="absolute inset-0 rounded-full bg-white dark:bg-slate-700 shadow-xs backdrop-blur-md border border-slate-300/80 dark:border-slate-600/60 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
