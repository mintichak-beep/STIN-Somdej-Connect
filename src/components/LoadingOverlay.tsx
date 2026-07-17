interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Synchronizing credentials...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-all duration-300">
      <div className="flex flex-col items-center space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-600/10 dark:bg-red-500/10"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent dark:border-red-500"></div>
        </div>
        <p className="font-sans text-sm font-semibold tracking-wide text-gray-700 dark:text-zinc-200">
          {message}
        </p>
      </div>
    </div>
  );
}
