"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { apiJson } from "@/lib/api-client";

export function DeleteSiteButton({
  id,
  confirmMessage,
  failedMessage,
}: {
  id: string;
  confirmMessage: string;
  failedMessage: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    setPending(true);
    try {
      await apiJson(`/api/sites/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : failedMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      {error ? <InlineAlert className="text-xs">{error}</InlineAlert> : null}
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
      >
        {pending ? "…" : "×"}
      </button>
    </div>
  );
}
