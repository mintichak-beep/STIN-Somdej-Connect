import { InputHTMLAttributes, forwardRef } from 'react';

interface RememberMeCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const RememberMeCheckbox = forwardRef<HTMLInputElement, RememberMeCheckboxProps>(
  ({ label = 'Remember me', className = '', ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2.5 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-red-600 checked:bg-red-600 focus:outline-hidden focus:ring-2 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-950 dark:checked:border-red-500 dark:checked:bg-red-500"
          />
          <svg
            className="pointer-events-none absolute left-0 top-0 h-5 w-5 stroke-white fill-none opacity-0 transition-opacity peer-checked:opacity-100"
            viewBox="0 0 24 24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-zinc-400 dark:group-hover:text-zinc-200">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RememberMeCheckbox.displayName = 'RememberMeCheckbox';
