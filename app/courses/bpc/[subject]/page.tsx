"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Subject = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
};

type Topic = {
  id: number;
  subject_id: number;
  name: string;
  description: string | null;
  slug: string;
  position: number;
};

export default function SubjectPage() {
  const params = useParams();

  const subjectSlug = params.subject as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubject() {
      setLoading(true);
      setError("");

      // Find the subject
      const {
        data: subjectData,
        error: subjectError,
      } = await supabase
        .from("subjects")
        .select("id, name, description, slug")
        .eq("slug", subjectSlug)
        .single();

      if (subjectError || !subjectData) {
        console.error("Subject error:", subjectError);
        setError("The subject could not be found.");
        setLoading(false);
        return;
      }

      setSubject(subjectData);

      // Find the topics belonging to this subject
      const {
        data: topicData,
        error: topicError,
      } = await supabase
        .from("topics")
        .select(
          "id, subject_id, name, description, slug, position"
        )
        .eq("subject_id", subjectData.id)
        .order("position");

      if (topicError) {
        console.error("Topic error:", topicError);
        setError("Unable to load topics.");
        setLoading(false);
        return;
      }

      setTopics(topicData ?? []);
      setLoading(false);
    }

    loadSubject();
  }, [subjectSlug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p>Loading subject...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Bar Practice Course
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Subject
          </h1>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">

            <h2 className="font-semibold text-red-800">
              Unable to load subject
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-5xl">

        {/* Breadcrumb */}

        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Bar Practice Course
        </p>

        {/* Subject heading */}

        <h1 className="mt-2 text-4xl font-bold">
          {subject?.name}
        </h1>

        {subject?.description && (
          <p className="mt-3 max-w-3xl text-gray-600">
            {subject.description}
          </p>
        )}

        {/* Topics */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold">
            Topics
          </h2>

          {topics.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-white p-6">
              <p className="text-gray-600">
                No topics are currently available for this subject.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {topics.map((topic) => (

                <Link
                  key={topic.id}
                  href={`/courses/bpc/${subjectSlug}/${topic.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold text-blue-600">
                        Topic {topic.position}
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {topic.name}
                      </h3>

                    </div>

                    <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </span>

                  </div>

                  {topic.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {topic.description}
                    </p>
                  )}

                </Link>

              ))}

            </div>
          )}

        </div>

      </div>

    </main>
  );
}