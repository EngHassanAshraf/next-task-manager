"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineAlert } from "@/components/app/inline-alert";

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
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (res?.error) {
      setError(labels.invalidCredentials);
      return;
    }
    router.push("/tasks");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {inactiveNotice ? (
        <InlineAlert tone="warning">{labels.inactiveNotice}</InlineAlert>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">{labels.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? (
        <InlineAlert role="alert">{error}</InlineAlert>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? labels.signingIn : labels.signIn}
      </Button>
    </form>
  );
}
