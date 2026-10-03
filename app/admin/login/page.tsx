"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex justify-center">
            <Image
              src="/brand/glaw-naturale-logo.svg"
              alt="GLAW Naturale"
              width={170}
              height={55}
              priority
              className="h-auto w-[150px]"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red">
              Admin
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy">
              Welcome back.
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Sign in to manage the GLAW Naturale website.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-navy"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your admin email"
                autoComplete="email"
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-navy"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red/10 px-4 py-3 text-sm text-red"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}