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

  const inputClass =
    "mt-1.5 h-11 w-full rounded-lg border border-jamogo-gray-300 bg-card px-3.5 text-[15px] text-jamogo-ink-900 outline-none transition-colors focus:border-jamogo-green-500 focus:ring-2 focus:ring-jamogo-green-500/20";

  return (
    <div className="flex min-h-screen bg-jamogo-bg">
      {/* Brand panel (wide screens) */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-jamogo-green-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-jamogo-green-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Image src="/favicon-48.png" alt="" width={28} height={28} />
          </div>
          <span className="font-heading text-lg font-semibold">Jamogo Admin</span>
        </div>
        <div className="relative">
          <h2 className="font-heading text-4xl leading-tight font-bold">
            Every ride,
            <br />
            <span className="text-jamogo-green-500">one place.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sidebar-foreground">
            Trips, riders, drivers, shared rides, commission and support for Jamogo, all in one
            dashboard.
          </p>
        </div>
        <p className="relative text-xs text-sidebar-foreground/60">© {new Date().getFullYear()} Jamogo</p>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <Image src="/brand/logo.png" alt="Jamogo" width={120} height={32} className="lg:hidden" />
          <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-jamogo-ink-900 lg:mt-0">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-jamogo-gray-500">
            Sign in with your admin account to continue.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-jamogo-ink-900">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-jamogo-ink-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            {error && (
              <p className="rounded-lg bg-jamogo-danger/10 px-3 py-2 text-sm text-jamogo-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={login.isPending} className="h-11 w-full">
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
