"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Topic = {
  id: number;
  name: string;
  slug: string;
  position: number;
};

type Question = {
  id: number;
  topic_id: number;
};

type Attempt = {
  question_id: number;
  correct: boolean;
  created_at: string;
};

type TopicProgress = Topic & {
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  accuracy: number;
  status: "Not started" | "Keep practising" | "Strong";
};

export default function ProgressPage() {
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "You must be logged in to view your progress."
        );
        setLoading(false);
        return;
      }

      const { data: topics, error: topicsError } =
        await supabase
          .from("topics")
          .select("id, name, slug, position")
          .order("position");

      if (topicsError) {
        console.error(topicsError);
        setError(topicsError.message);
        setLoading(false);
        return;
      }

      const { data: questions, error: questionsError } =
        await supabase
          .from("questions")
          .select("id, topic_id");

      if (questionsError) {
        console.error(questionsError);
        setError(questionsError.message);
        setLoading(false);
        return;
      }

      const { data: attempts, error: attemptsError } =
        await supabase
          .from("attempts")
          .select(
            "question_id, correct, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (attemptsError) {
        console.error(attemptsError);
        setError(attemptsError.message);
        setLoading(false);
        return;
      }

      const questionList: Question[] =
        questions ?? [];

      const attemptList: Attempt[] =
        attempts ?? [];

      const progress: TopicProgress[] =
        (topics ?? []).map((topic) => {
          const topicQuestions =
            questionList.filter(
              (question) =>
                question.topic_id === topic.id
            );

          /*
           * Because attempts are ordered newest first,
           * the first attempt we encounter for each
           * question is the learner's latest result.
           */
          const latestResults = new Map<
            number,
            boolean
          >();

          for (const attempt of attemptList) {
            const questionBelongsToTopic =
              topicQuestions.some(
                (question) =>
                  question.id ===
                  attempt.question_id
              );

            if (
              questionBelongsToTopic &&
              !latestResults.has(
                attempt.question_id
              )
            ) {
              latestResults.set(
                attempt.question_id,
                attempt.correct
              );
            }
          }

          const attemptedQuestions =
            latestResults.size;

          const correctQuestions =
            Array.from(
              latestResults.values()
            ).filter(Boolean).length;

          const accuracy =
            attemptedQuestions > 0
              ? Math.round(
                  (correctQuestions /
                    attemptedQuestions) *
                    100
                )
              : 0;

          let status:
            | "Not started"
            | "Keep practising"
            | "Strong";

          if (attemptedQuestions === 0) {
            status = "Not started";
          } else if (accuracy >= 80) {
            status = "Strong";
          } else {
            status = "Keep practising";
          }

          return {
            ...topic,
            totalQuestions:
              topicQuestions.length,
            attemptedQuestions,
            correctQuestions,
            accuracy,
            status,
          };
        });

      setTopicProgress(progress);
      setLoading(false);
    }

    loadProgress();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">
            Loading your progress...
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
            Your Progress
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

  const totalQuestions =
    topicProgress.reduce(
      (total, topic) =>
        total + topic.totalQuestions,
      0
    );

  const attemptedQuestions =
    topicProgress.reduce(
      (total, topic) =>
        total + topic.attemptedQuestions,
      0
    );

  const correctQuestions =
    topicProgress.reduce(
      (total, topic) =>
        total + topic.correctQuestions,
      0
    );

  const overallAccuracy =
    attemptedQuestions > 0
      ? Math.round(
          (correctQuestions /
            attemptedQuestions) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Law with Charlie Learn
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Progress
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            See how you are performing across your
            learning topics and identify where you
            should practise next.
          </p>
        </div>

        {/* Overall statistics */}

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Available questions
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalQuestions}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Questions attempted
            </p>

            <p className="mt-2 text-4xl font-bold">
              {attemptedQuestions}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Correct
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {correctQuestions}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Overall accuracy
            </p>

            <p className="mt-2 text-4xl font-bold">
              {overallAccuracy}%
            </p>
          </div>

        </div>

        {/* Topics */}

        <section className="mt-10">

          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Your topics
            </h2>

            <p className="mt-1 text-gray-600">
              Your latest performance on each topic.
            </p>
          </div>

          <div className="space-y-5">

            {topicProgress.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-gray-500">
                      Topic {topic.position}
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      {topic.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      {topic.attemptedQuestions} of{" "}
                      {topic.totalQuestions} questions
                      attempted
                    </p>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">

                      <p className="text-2xl font-bold">
                        {topic.attemptedQuestions >
                        0
                          ? `${topic.accuracy}%`
                          : "—"}
                      </p>

                      <p className="text-sm text-gray-500">
                        accuracy
                      </p>

                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        topic.status ===
                        "Strong"
                          ? "bg-green-100 text-green-700"
                          : topic.status ===
                            "Keep practising"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {topic.status}
                    </div>

                  </div>

                </div>

                {/* Progress bar */}

                <div className="mt-6">

                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${
                          topic.totalQuestions >
                          0
                            ? Math.min(
                                (topic.attemptedQuestions /
                                  topic.totalQuestions) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />

                  </div>

                </div>

                {/* Topic action */}

                <div className="mt-6">

                  {topic.slug ===
                    "core-duties" && (
                    <Link
                      href="/courses/bpc/professional-ethics/core-duties"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Practise this topic →
                    </Link>
                  )}

                </div>

              </div>
            ))}

          </div>

        </section>

      </div>
    </main>
  );
}