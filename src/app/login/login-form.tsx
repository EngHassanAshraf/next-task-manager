"use client";

import { useState } from "react";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({
  inactiveNotice = false,
  labels,
}: {
  inactiveNotice?: boolean;
  labels: {
    inactiveNotice: string;
    email: string;
    password: string;
    invalidCredentials: string;
    signingIn: string;
    signIn: string;
  };
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError(labels.invalidCredentials);
      return;
    }
    router.push("/tasks");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {inactiveNotice ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {labels.inactiveNotice}
        </p>
      ) : null}
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {labels.email}
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {labels.password}
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? labels.signingIn : labels.signIn}
      </button>
    </form>
  );
}
