import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Courses() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*");

  if (error) {
    console.error(error);

    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Courses
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load courses.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold">
          Courses
        </h1>

        <p className="mb-8 text-gray-600">
          Choose what you want to learn.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {courses?.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group"
            >
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Course
                </div>

                <h2 className="text-2xl font-bold group-hover:underline">
                  {course.name}
                </h2>

                <p className="mt-3 text-gray-600">
                  {course.description}
                </p>

                <div className="mt-6 font-semibold">
                  Start learning →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}