export function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-600/10 dark:bg-red-500/10"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent dark:border-red-500"></div>
        </div>
        <p className="font-sans text-sm font-semibold tracking-wide text-gray-600 dark:text-zinc-400">
          Loading CPATMS Platform...
        </p>
      </div>
    </div>
  );
}
