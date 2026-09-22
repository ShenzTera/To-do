import { useState, useRef, useEffect } from 'react';
import { Reorder, useMotionValue } from 'motion/react';
import { 
  Check, 
  Trash2, 
  GripVertical, 
  Pencil, 
  X, 
  Tag, 
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, category?: Category, priority?: Priority) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editCategory, setEditCategory] = useState<Category | undefined>(task.category);
  const [editPriority, setEditPriority] = useState<Priority | undefined>(task.priority);
  const [isHovered, setIsHovered] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim(), editCategory, editPriority);
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const categoryBadges: Record<Category, { label: string; color: string }> = {
    personal: { label: 'Personal', color: 'bg-emerald-100/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/15' },
    work: { label: 'Work', color: 'bg-blue-100/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-500/30 dark:bg-blue-500/15' },
    urgent: { label: 'Urgent', color: 'bg-rose-100/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 dark:bg-rose-500/15' },
    daily: { label: 'Daily', color: 'bg-amber-100/80 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 dark:bg-amber-500/15' },
  };

  const priorityDots: Record<Priority, { label: string; color: string }> = {
    low: { label: 'Low', color: 'bg-slate-500' },
    medium: { label: 'Medium', color: 'bg-amber-600' },
    high: { label: 'High', color: 'bg-rose-600' },
  };

  return (
    <Reorder.Item
      id={`task-item-${task.id}`}
      value={task}
      style={{ y }}
      whileDrag={{
        scale: 1.02,
        zIndex: 50,
      }}
      className={`relative group rounded-xl p-3 sm:p-3.5 transition-colors duration-200 select-none glass-item ${
        task.completed ? 'opacity-70 dark:opacity-60 bg-slate-100/70 dark:bg-slate-900/30' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div
          id={`drag-handle-${task.id}`}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 p-1 -ml-1 rounded-md transition-colors touch-none"
          title="Drag to reorder task"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Custom Glass Checkbox */}
        <button
          type="button"
          id={`toggle-task-${task.id}`}
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border ${
            task.completed
              ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 text-white shadow-xs shadow-indigo-500/30'
              : 'border-slate-400 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white/90 dark:bg-slate-800/40 shadow-2xs'
          }`}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          )}
        </button>

        {/* Task Content / Editing Mode */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white dark:bg-slate-800 px-2.5 py-1 text-sm rounded-lg border border-indigo-500 text-slate-900 dark:text-slate-100 focus:outline-hidden ring-2 ring-indigo-500/20 font-medium"
            />
            <button
              type="button"
              id={`save-edit-${task.id}`}
              onClick={handleSaveEdit}
              className="p-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Save changes"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              id={`cancel-edit-${task.id}`}
              onClick={handleCancelEdit}
              className="p-1.5 rounded-lg bg-slate-500/15 hover:bg-slate-500/25 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
          >
            <span
              className={`text-sm sm:text-base tracking-tight break-words transition-all duration-200 ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                  : 'text-slate-900 dark:text-slate-100 font-medium'
              }`}
            >
              {task.text}
            </span>

            {/* Badges & Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              {task.category && categoryBadges[task.category] && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                    categoryBadges[task.category].color
                  }`}
                >
                  {categoryBadges[task.category].label}
                </span>
              )}

              {task.priority && priorityDots[task.priority] && (
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium"
                  title={`Priority: ${priorityDots[task.priority].label}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${priorityDots[task.priority].color}`}
                  />
                  <span className="hidden md:inline">{priorityDots[task.priority].label}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons (Edit, Delete) */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
            <button
              type="button"
              id={`edit-task-btn-${task.id}`}
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              title="Edit task (or double-click)"
              aria-label="Edit task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id={`delete-task-btn-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/15 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}
