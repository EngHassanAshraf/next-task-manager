export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-64 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

