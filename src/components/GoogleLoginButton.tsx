import { MouseEventHandler } from 'react';

export interface GoogleLoginButtonProps {
  isLoading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

export function GoogleLoginButton({ isLoading, className = '', onClick, disabled, ...props }: GoogleLoginButtonProps) {
  return (
    <button
      {...props}
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-all duration-200 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-red-600/10 active:bg-gray-100 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80 ${className}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.99 0 12 0 7.354 0 3.307 2.69 1.34 6.613l3.926 3.152z"
          />
          <path
            fill="#4285F4"
            d="M16.04 15.34c-1.07.727-2.437 1.17-4.04 1.17-2.927 0-5.41-1.982-6.294-4.654L1.756 14.99c1.94 3.864 5.96 6.51 10.244 6.51 2.91 0 5.618-1.01 7.627-2.75l-3.587-3.41z"
          />
          <path
            fill="#34A853"
            d="M5.746 11.856a6.994 6.994 0 0 1 0-2.288L1.82 6.416a11.96 11.96 0 0 0 0 8.582l3.926-3.142z"
          />
          <path
            fill="#FBBC05"
            d="M23.49 12.275c0-.82-.07-1.603-.205-2.363H12v4.473h6.463A5.518 5.518 0 0 1 16.04 15.34l3.587 3.41c2.1-1.937 3.863-5.182 3.863-8.75h-.264z"
          />
        </svg>
      )}
      <span>Continue with Google</span>
    </button>
  );
}
