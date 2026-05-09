"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import logo from "@/public/ledgerOS.png";
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
    } catch (e) {
      setError("Google sign up failed!");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

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
    } catch (e: any) {
      setError(e.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#3D444D] bg-[#0D1117] p-6 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={logo}
            alt="LedgerOS Logo"
            className="mb-4 h-14 w-14 rounded-xl"
            priority
          />

          <h1 className="text-2xl font-semibold text-white">
            Create your LedgerOS account
          </h1>

          <p className="mt-2 text-sm text-[#8B949E]">
            Track expenses, subscriptions, and budgets in one place.
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

          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#3D444D]" />
          <span className="text-xs text-[#8B949E]">OR</span>
          <div className="h-px flex-1 bg-[#3D444D]" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Display name
            </label>

            <input
              type="text"
              placeholder="Takshil Pandya"
              value={data.displayName}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
            />

            {fieldError.displayName && (
              <p className="mt-2 text-xs text-red-400">
                {fieldError.displayName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
            />

            {fieldError.email && (
              <p className="mt-2 text-xs text-red-400">
                {fieldError.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={data.password}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[#3D444D] bg-[#010409] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#8B949E] transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="text-[#8B949E] stroke-[2.2]"
                  />
                ) : (
                  <Eye
                    size={18}
                    className="text-[#8B949E] stroke-[2.2]"
                  />
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8B949E]">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-[#58A6FF] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}