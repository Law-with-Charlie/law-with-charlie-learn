import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero */}

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:gap-16 lg:py-28">

          <div className="max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Law with Charlie
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learn law.
              <br />
              Build confidence.
              <br />
              Prepare for practice.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-gray-600">
              Law with Charlie Learn is an interactive learning
              platform for law students and aspiring barristers.
              Practise questions, track your progress and focus
              on the areas where you need the most work.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">

              <Link
                href="/courses"
                className="rounded-xl bg-blue-600 px-7 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Explore courses →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-gray-300 bg-white px-7 py-4 text-center font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Get started
              </Link>

            </div>

          </div>

          {/* Hero card */}

          <div className="mt-12 w-full max-w-md lg:mt-0 lg:ml-auto">

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-xl">

              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <p className="text-sm font-semibold text-gray-500">
                  BPC · Professional Ethics
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Core Duties
                </h2>

                <div className="mt-6">

                  <div className="mb-2 flex justify-between text-sm text-gray-500">
                    <span>
                      Question 3 of 8
                    </span>

                    <span>
                      38%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: "38%" }}
                    />
                  </div>

                </div>

                <div className="mt-6 rounded-xl border border-gray-200 p-5">

                  <p className="font-semibold leading-relaxed">
                    Which of the following best describes
                    a barrister's duty to act with honesty
                    and integrity?
                  </p>

                  <div className="mt-5 space-y-2">

                    <div className="rounded-lg border p-3 text-sm">
                      A. To act honestly and with integrity
                    </div>

                    <div className="rounded-lg border p-3 text-sm">
                      B. To act only in the client's interests
                    </div>

                    <div className="rounded-lg border p-3 text-sm">
                      C. To follow every client instruction
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Why Law with Charlie Learn */}

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Why Law with Charlie Learn?
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Learning designed around practice
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Build your knowledge through active recall,
              practise questions and personalised feedback
              rather than simply reading and hoping you
              remember it later.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

              <div className="text-3xl">
                🎯
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Active practice
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Test yourself with questions designed to
                help turn legal knowledge into something
                you can actually recall.
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

              <div className="text-3xl">
                📈
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Track your progress
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Your answers are saved to your account so
                you can see how you are performing and
                identify areas that need more work.
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

              <div className="text-3xl">
                🧠
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Learn what you need
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Questions can be revisited according to
                your previous performance, helping you
                focus on areas that need attention.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Featured learning */}

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Start learning
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Featured learning
              </h2>

              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Explore the subjects currently available on
                Law with Charlie Learn.
              </p>

            </div>

            <Link
              href="/courses"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              View all courses →
            </Link>

          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {/* BPC */}

            <Link
              href="/courses/bpc"
              className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
            >

              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Course
              </p>

              <h3 className="mt-3 text-3xl font-bold group-hover:underline">
                Bar Practice Course
              </h3>

              <p className="mt-4 max-w-xl text-gray-600">
                Practise key areas of knowledge and
                professional conduct relevant to aspiring
                barristers.
              </p>

              <div className="mt-8 font-semibold">
                Explore BPC →
              </div>

            </Link>

            {/* Professional Ethics */}

            <Link
              href="/courses/bpc/professional-ethics"
              className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
            >

              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                BPC · Subject
              </p>

              <h3 className="mt-3 text-3xl font-bold group-hover:underline">
                Professional Ethics
              </h3>

              <p className="mt-4 max-w-xl text-gray-600">
                Core duties, professional conduct and
                ethical obligations.
              </p>

              <div className="mt-8 font-semibold">
                Start learning →
              </div>

            </Link>

          </div>

        </div>
      </section>

      {/* Personalised learning */}

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-3xl bg-gray-900 px-8 py-12 text-white sm:px-12 sm:py-16">

            <div className="max-w-3xl">

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
                Your learning
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Your progress. Your questions. Your learning.
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-300">
                Create an account and Law with Charlie Learn
                will keep track of your answers, helping you
                understand where you are performing well and
                where you need more practice.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">

                <Link
                  href="/login"
                  className="rounded-xl bg-white px-7 py-4 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Get started →
                </Link>

                <Link
                  href="/courses"
                  className="rounded-xl border border-gray-700 px-7 py-4 text-center font-semibold text-white transition hover:bg-gray-800"
                >
                  Explore courses
                </Link>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Final CTA */}

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to start learning?
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Explore the available courses and start building
            your knowledge today.
          </p>

          <Link
            href="/courses"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            Explore courses →
          </Link>

        </div>
      </section>

    </main>
  );
}