"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  async function handleLogout() {
    await signOut({
      redirect: false,
    });

    router.push("/signin");
    router.refresh();
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-xl">
      <p className="text-white">{session?.user?.email}</p>

      <button
        onClick={handleLogout}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </div>
  );
}