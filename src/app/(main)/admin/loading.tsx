export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}

