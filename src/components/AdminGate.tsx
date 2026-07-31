"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdminSession, useCurrentAdmin, useLogin } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { session } = useAdminSession();
  const currentAdmin = useCurrentAdmin();

  if (session && currentAdmin.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-jamogo-bg">
        <Spinner />
      </div>
    );
  }

  if (session && currentAdmin.isSuccess) {
    return <>{children}</>;
  }

  return <LoginForm />;
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError(null);
    login.mutate(
      { username: username.trim(), password },
      {
        onError: (err) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
            setError("Incorrect username or password.");
          } else if (err instanceof ApiError && err.status === 403) {
            setError(err.message);
          } else {
            setError("Couldn't reach the API. Check your connection and try again.");
          }
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-jamogo-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-jamogo-gray-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(14,26,19,0.08)]">
        <Image
          src="/brand/logo.png"
          alt="Jamogo"
          width={120}
          height={32}
          className="mx-auto"
        />
        <h1 className="mt-6 font-heading text-xl font-semibold text-jamogo-ink-900">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-jamogo-gray-500">
          Sign in with your admin account to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
          <div>
            <label className="text-sm font-medium text-jamogo-ink-900">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-4 py-2.5 text-[15px] outline-none focus:border-jamogo-green-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-jamogo-ink-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-4 py-2.5 text-[15px] outline-none focus:border-jamogo-green-500"
            />
          </div>
          {error && <p className="text-sm text-jamogo-danger">{error}</p>}
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
