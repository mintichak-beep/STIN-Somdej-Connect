import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit2, Trash2, Archive, Check, Ban, Copy, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: 'view' | 'edit' | 'delete' | 'archive' | 'activate' | 'deactivate' | 'duplicate' | 'current';
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  id?: string;
  actions: ActionMenuItem[];
}

export function ActionMenu({ id, actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'view': return <Eye className="h-3.5 w-3.5 shrink-0" />;
      case 'edit': return <Edit2 className="h-3.5 w-3.5 shrink-0" />;
      case 'delete': return <Trash2 className="h-3.5 w-3.5 shrink-0" />;
      case 'archive': return <Archive className="h-3.5 w-3.5 shrink-0" />;
      case 'activate': return <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />;
      case 'deactivate': return <Ban className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />;
      case 'duplicate': return <Copy className="h-3.5 w-3.5 shrink-0" />;
      case 'current': return <FolderHeart className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div id={id} ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-gray-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-50 mt-1.5 w-48 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-col gap-0.5">
              {actions.map((act, index) => (
                <button
                  key={index}
                  disabled={act.disabled}
                  onClick={() => {
                    setIsOpen(false);
                    act.onClick();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    act.danger
                      ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20'
                      : 'text-gray-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-900'
                  }`}
                >
                  {getIcon(act.icon)}
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
