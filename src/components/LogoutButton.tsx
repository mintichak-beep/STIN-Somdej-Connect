import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ className = '', showText = true }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-900 active:scale-95 disabled:opacity-50 ${className}`}
      title="Logout from STIN-Somdej Connect"
    >
      {isLoggingOut ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      ) : (
        <LogOut className="h-4 w-4 text-red-600 dark:text-red-500" />
      )}
      {showText && <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>}
    </button>
  );
}
