"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Eye, EyeOff } from "lucide-react";
import { loginRequest } from "@/lib/api";
import { CITY_NAME } from "@/lib/mockData";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ananya.deshmukh@indoresmartcity.gov.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginRequest(email, password);
      router.push("/dashboard");
    } catch {
      setError("Unable to sign in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl2 bg-brand-600 text-white">
            <Radio size={22} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Smart Bus Fleet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Urban Sensing Platform · {CITY_NAME} Smart City Mission</p>
        </div>

        <form
          onSubmit={handleSignIn}
          className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@municipality.gov.in"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-9 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Continue as Demo
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Smart India Hackathon Prototype · For municipal evaluation use only
        </p>
      </div>
    </div>
  );
}
