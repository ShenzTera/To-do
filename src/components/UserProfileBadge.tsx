import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface UserProfileBadgeProps {
  user: User;
  onLogout: () => void;
}

export function UserProfileBadge({ user, onLogout }: UserProfileBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="user-profile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 pl-1.5 pr-2.5 rounded-full glass-pill border border-slate-300/80 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
          {getInitials(user.name)}
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[110px] truncate">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-3 shadow-xl z-50 border border-slate-300/90 dark:border-slate-700/80"
          >
            <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="sign-out-btn"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
