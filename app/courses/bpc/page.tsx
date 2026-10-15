import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function BPCPage() {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name, description, slug")
    .eq("slug", "bpc")
    .single();

  if (courseError || !course) {
    console.error(courseError);

    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Bar Practice Course
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load the Bar Practice Course.
          </p>
        </div>
      </main>
    );
  }

  const { data: subjects, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name, description, slug")
    .eq("course_id", course.id)
    .order("id");

  if (subjectError) {
    console.error(subjectError);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}

        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Law with Charlie Learn
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {course.name}
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          {course.description}
        </p>

        {/* Subjects */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold">
            Subjects
          </h2>

          <p className="mt-2 text-gray-600">
            Choose a subject to begin learning.
          </p>

          {!subjects || subjects.length === 0 ? (
            <div className="mt-6 rounded-2xl border bg-white p-6">
              <p className="text-gray-600">
                No subjects are currently available.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/courses/bpc/${subject.slug}`}
                  className="group"
                >

                  <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">

                    <h3 className="text-2xl font-bold group-hover:underline">
                      {subject.name}
                    </h3>

                    {subject.description && (
                      <p className="mt-3 text-gray-600">
                        {subject.description}
                      </p>
                    )}

                    <div className="mt-6 font-semibold">
                      View subject →
                    </div>

                  </div>

                </Link>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}