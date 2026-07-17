import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
          </div>
          <input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 placeholder-gray-400 outline-hidden transition-all duration-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/10 ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500' : ''
            } ${className}`}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
