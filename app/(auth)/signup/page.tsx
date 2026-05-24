"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import logo from "@/public/ledgerOS.png";
import DashboardBackground from "@/public/auth-dashboard-preview.png";
import { SignupZod } from "@/lib/validators/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    displayName: "",
    password: "",
  });

  const [fieldError, setFieldError] = useState({
    email: "",
    displayName: "",
    password: "",
  });

  const [error, setError] = useState("");

  async function handleGoogleSubmit() {
    try {
      setError("");
      setGoogleLoading(true);

      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Google sign up failed!");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();

      setLoading(true);
      setError("");

      setFieldError({
        email: "",
        displayName: "",
        password: "",
      });

      const valid = SignupZod.safeParse(data);

      if (!valid.success) {
        const fieldErrors = valid.error.flatten().fieldErrors;

        setFieldError({
          email: fieldErrors.email?.[0] || "",
          displayName: fieldErrors.displayName?.[0] || "",
          password: fieldErrors.password?.[0] || "",
        });

        return;
      }

      const res = await axios.post("/api/auth/signup", valid.data);

      if (!res.data.ok) {
        setError(res.data.error);
        return;
      }

      router.push("/signin");
      router.refresh();
    } catch (error: any) {
      setError(error.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#010409] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden border-r border-[#3D444D] lg:block">
          <Image
            src={DashboardBackground}
            alt="LedgerOS dashboard preview"
            fill
            priority
            className="object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-[#010409]/20" />
          <div className="absolute inset-0 bg-linear-to-r from-[#010409]/65 via-[#010409]/30 to-[#010409]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,rgba(46,160,67,0.28),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(88,166,255,0.18),transparent_32%)]" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between px-12 py-10 xl:px-16">
            <div className="flex items-center justify-between">
              <Image
                src={logo}
                alt="LedgerOS Logo"
                priority
                className="h-auto w-40"
              />

              <div className="inline-flex items-center gap-2 rounded-full border border-[#3D444D] bg-[#0D1117]/75 px-3 py-2 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-[#3FB950]" />
                <span className="text-xs font-medium text-[#C9D1D9]">
                  Secure finance dashboard
                </span>
              </div>
            </div>

            <div className="w-full max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#238636]/30 bg-[#238636]/10 px-3 py-1.5 text-xs font-medium text-[#3FB950]">
                <Wallet className="h-4 w-4" />
                Personal finance made simple
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                Start tracking your money with LedgerOS.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#C9D1D9]">
                Create your account to track expenses, subscriptions, budgets,
                renewals, and spending insights from one clean dashboard.
              </p>

              <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-[#0D1117]/55 p-5 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Your personal finance command center.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                      Built for expenses, subscriptions, budgets, and spending
                      clarity.
                    </p>
                  </div>

                  <span className="rounded-full border border-[#238636]/30 bg-[#238636]/10 px-3 py-1 text-xs font-medium text-[#3FB950]">
                    V1
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FeaturePoint>Find spending leaks faster</FeaturePoint>
                  <FeaturePoint>Catch renewal dates early</FeaturePoint>
                  <FeaturePoint>Track budget health</FeaturePoint>
                  <FeaturePoint>Review weekly spending</FeaturePoint>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <FeatureChip>Daily expenses</FeatureChip>
                <FeatureChip>Budget alerts</FeatureChip>
                <FeatureChip>Renewal tracking</FeatureChip>
                <FeatureChip>No-spend progress</FeatureChip>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <Sparkles className="h-4 w-4 text-[#58A6FF]" />
              Built to help you understand where your money goes.
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center bg-[#010409] px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(88,166,255,0.08),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(46,160,67,0.08),transparent_30%)]" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <Image
                src={logo}
                alt="LedgerOS Logo"
                priority
                className="mx-auto h-auto w-40"
              />

              <h1 className="mt-6 text-2xl font-bold text-white">
                Create your LedgerOS account
              </h1>
              <p className="mt-2 text-sm text-[#8B949E]">
                Start tracking your expenses and subscriptions.
              </p>
            </div>

            <div className="rounded-3xl border border-[#3D444D] bg-[#0D1117]/85 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="mb-6 hidden lg:block">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#58A6FF]">
                  Get started
                </p>
                <h2 className="text-3xl font-bold text-white">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-[#8B949E]">
                  Set up LedgerOS and start tracking your money today.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={googleLoading || loading}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white transition hover:bg-[#1f2630] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FcGoogle size={20} />
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#3D444D]" />
                <span className="text-xs text-[#8B949E]">OR</span>
                <div className="h-px flex-1 bg-[#3D444D]" />
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C9D1D9]">
                    Display name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B949E]" />

                    <input
                      type="text"
                      placeholder="Takshil Pandya"
                      value={data.displayName}
                      onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          displayName: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
                    />
                  </div>

                  {fieldError.displayName && (
                    <p className="mt-2 text-xs text-red-400">
                      {fieldError.displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C9D1D9]">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B949E]" />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
                    />
                  </div>

                  {fieldError.email && (
                    <p className="mt-2 text-xs text-red-400">
                      {fieldError.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C9D1D9]">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B949E]" />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={data.password}
                      onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#8B949E] transition hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="stroke-[2.2]" />
                      ) : (
                        <Eye size={18} className="stroke-[2.2]" />
                      )}
                    </button>
                  </div>

                  {fieldError.password && (
                    <p className="mt-2 text-xs text-red-400">
                      {fieldError.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="group flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#8B949E]">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-[#58A6FF] transition hover:text-[#79C0FF]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeaturePoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#C9D1D9]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950]" />
      <span>{children}</span>
    </div>
  );
}

function FeatureChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-[#0D1117]/65 px-3 py-1.5 text-xs font-medium text-[#C9D1D9] backdrop-blur-md">
      {children}
    </span>
  );
}