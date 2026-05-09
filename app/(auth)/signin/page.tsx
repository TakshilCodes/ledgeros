"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/public/ledgerOS.png";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [fieldError, setFieldError] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setFieldError({
      email: "",
      password: "",
    });

    if (!data.email.trim()) {
      setFieldError((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return;
    }

    if (!data.password.trim()) {
      setFieldError((prev) => ({
        ...prev,
        password: "Password is required",
      }));
      return;
    }

    try {
      setLoading(true);

      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSubmit() {
    try {
      setGoogleLoading(true);
      setError("");

      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      setError("Google sign in failed!");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#3D444D] bg-[#0D1117] p-6 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={logo}
            alt="LedgerOS Logo"
            className="mb-4 h-10 w-40 rounded-xl"
            priority
          />

          <h1 className="text-2xl font-semibold text-white">
            Sign in to LedgerOS
          </h1>

          <p className="mt-2 text-sm text-[#8B949E]">
            Welcome back. Continue tracking your expenses and subscriptions.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSubmit}
          disabled={googleLoading || loading}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#3D444D] bg-[#151B23] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f2630] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle size={20} />
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#3D444D]" />
          <span className="text-xs text-[#8B949E]">OR</span>
          <div className="h-px flex-1 bg-[#3D444D]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Email
            </label>

            <input
              type="email"
              value={data.email}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
            />

            {fieldError.email && (
              <p className="mt-2 text-xs text-red-400">{fieldError.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#3D444D] bg-[#010409] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#8B949E] transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-[#8B949E] stroke-[2.2]" />
                ) : (
                  <Eye size={18} className="text-[#8B949E] stroke-[2.2]" />
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
            className="w-full cursor-pointer rounded-lg bg-[#2ea043] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#238636] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8B949E]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#58A6FF] hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}