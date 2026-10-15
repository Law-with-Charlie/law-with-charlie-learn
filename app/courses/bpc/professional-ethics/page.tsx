import Link from "next/link";
import { supabase } from "@/lib/supabase";


export default async function ProfessionalEthics() {
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", "professional-ethics")
    .single();

  if (subjectError || !subject) {
    console.error(subjectError);

    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Professional Ethics
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load this subject.
          </p>
        </div>
      </main>
    );
  }

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subject.id)
    .order("position");

  if (topicsError) {
    console.error(topicsError);

    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Professional Ethics
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load topics.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            BPC
          </p>

          <h1 className="text-4xl font-bold">
            {subject.name}
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            {subject.description}
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold">
          Topics
        </h2>

        {topics && topics.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/courses/bpc/professional-ethics/${topic.slug}`}
                className="group"
              >
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-3 text-sm font-semibold text-gray-500">
                    Topic {topic.position}
                  </div>

                  <h3 className="text-xl font-bold group-hover:underline">
                    {topic.name}
                  </h3>

                  <p className="mt-3 text-gray-600">
                    {topic.description}
                  </p>

                  <div className="mt-6 font-semibold">
                    Start learning →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No topics are available yet.
          </p>
        )}
      </div>
    </main>
  );
}