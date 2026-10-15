"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Attempt = {
  question_id: number;
  correct: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view your dashboard.");
        setLoading(false);
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "there";

      setUserName(name);

      const { data, error } = await supabase
        .from("attempts")
        .select("question_id, correct, created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Dashboard error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setAttempts(data ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const totalAttempts = attempts.length;

  const correctAttempts = attempts.filter(
    (attempt) => attempt.correct
  ).length;

  const accuracy =
    totalAttempts > 0
      ? Math.round(
          (correctAttempts / totalAttempts) * 100
        )
      : 0;

  const latestResults = new Map<number, boolean>();

  for (const attempt of attempts) {
    if (!latestResults.has(attempt.question_id)) {
      latestResults.set(
        attempt.question_id,
        attempt.correct
      );
    }
  }

  const questionsNeedingPractice =
    Array.from(latestResults.values()).filter(
      (correct) => !correct
    ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Welcome */}

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Law with Charlie Learn
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Welcome back, {userName}
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Continue your learning and keep building
            your legal knowledge.
          </p>
        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Questions attempted
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalAttempts}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Accuracy
            </p>

            <p className="mt-2 text-4xl font-bold">
              {accuracy}%
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Need more practice
            </p>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {questionsNeedingPractice}
            </p>
          </div>

        </div>

        {/* Continue learning */}

        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Continue learning
            </h2>

            <p className="mt-1 text-gray-600">
              Pick up where you left off.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  BPC · Professional Ethics
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Core Duties
                </h3>

                <p className="mt-2 max-w-xl text-gray-600">
                  Practise the core professional duties
                  expected of barristers.
                </p>
              </div>

              <Link
                href="/courses/bpc/professional-ethics/core-duties"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Continue practising →
              </Link>

            </div>

          </div>

        </section>

        {/* Quick links */}

        <section className="mt-10">

          <h2 className="mb-5 text-2xl font-bold">
            Your learning
          </h2>

          <div className="grid gap-6 md:grid-cols-3">

            <Link
              href="/courses"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold group-hover:underline">
                Courses
              </h3>

              <p className="mt-2 text-gray-600">
                Explore available courses and subjects.
              </p>

              <p className="mt-5 font-semibold">
                Browse courses →
              </p>
            </Link>

            <Link
              href="/progress"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold group-hover:underline">
                Progress
              </h3>

              <p className="mt-2 text-gray-600">
                See your performance and identify areas
                for improvement.
              </p>

              <p className="mt-5 font-semibold">
                View progress →
              </p>
            </Link>

            <Link
              href="/account"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold group-hover:underline">
                Account
              </h3>

              <p className="mt-2 text-gray-600">
                Manage your account and learning settings.
              </p>

              <p className="mt-5 font-semibold">
                Manage account →
              </p>
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}