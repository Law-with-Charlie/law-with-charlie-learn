"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      setName(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      setError(error.message);
      setSigningOut(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Law with Charlie Learn
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Account
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            Manage your account and access your learning.
          </p>
        </div>

        {/* Account details */}

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold">
            Account details
          </h2>

          <div className="mt-8 space-y-6">

            {name && (
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Name
                </p>

                <p className="mt-1 text-lg">
                  {name}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Email address
              </p>

              <p className="mt-1 text-lg">
                {email}
              </p>
            </div>

          </div>

        </div>

        {/* Quick links */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <Link
            href="/dashboard"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold group-hover:underline">
              Dashboard
            </h2>

            <p className="mt-2 text-gray-600">
              Continue your learning and see your latest
              activity.
            </p>

            <p className="mt-5 font-semibold">
              Go to dashboard →
            </p>
          </Link>

          <Link
            href="/progress"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold group-hover:underline">
              Progress
            </h2>

            <p className="mt-2 text-gray-600">
              Review your performance and identify areas
              for improvement.
            </p>

            <p className="mt-5 font-semibold">
              View progress →
            </p>
          </Link>

        </div>

        {/* Sign out */}

        <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold">
            Sign out
          </h2>

          <p className="mt-2 text-gray-600">
            Sign out of your Law with Charlie Learn
            account on this device.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>

        </div>

      </div>
    </main>
  );
}