import Link from "next/link";

export type PaginationLabels = {
  pageOf: string;
  total: string;
  prev: string;
  next: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  labels,
  locale,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  labels: PaginationLabels;
  locale?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const pageOf = labels.pageOf
    .replace("{page}", String(page))
    .replace("{totalPages}", String(totalPages));
  const totalLabel = labels.total.replace("{total}", total.toLocaleString(locale));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
      <span>
        {pageOf} · {totalLabel}
      </span>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={`${basePath}?page=${prev}&pageSize=${pageSize}`}
            aria-label={labels.prev}
            className="rounded border border-zinc-200 px-2 py-1 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900/50 dark:focus:ring-zinc-700"
          >
            {labels.prev}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded border border-zinc-200 px-2 py-1 opacity-50 dark:border-zinc-800"
          >
            {labels.prev}
          </span>
        )}
        {next ? (
          <Link
            href={`${basePath}?page=${next}&pageSize=${pageSize}`}
            aria-label={labels.next}
            className="rounded border border-zinc-200 px-2 py-1 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900/50 dark:focus:ring-zinc-700"
          >
            {labels.next}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded border border-zinc-200 px-2 py-1 opacity-50 dark:border-zinc-800"
          >
            {labels.next}
          </span>
        )}
      </div>
    </div>
  );
}

