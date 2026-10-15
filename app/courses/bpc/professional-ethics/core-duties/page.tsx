"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Question = {
  id: number;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  difficulty: number;
};

type Attempt = {
  question_id: number;
  correct: boolean;
  created_at: string;
};

export default function CoreDutiesPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAnswer, setSelectedAnswer] = useState<
    "A" | "B" | "C" | "D" | null
  >(null);

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError("");

      // Get the currently signed-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to practise.");
        setLoading(false);
        return;
      }

      // Load all questions for Core Duties
      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from("questions")
        .select("*")
        .eq("topic_id", 1)
        .order("id");

      if (questionError) {
        console.error("Question error:", questionError);
        setError(questionError.message);
        setLoading(false);
        return;
      }

      if (!questionData || questionData.length === 0) {
        setError("No questions were found for this topic.");
        setLoading(false);
        return;
      }

      // Load this user's previous attempts
      const {
        data: attemptData,
        error: attemptError,
      } = await supabase
        .from("attempts")
        .select("question_id, correct, created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (attemptError) {
        console.error("Attempt history error:", attemptError);
        setError(attemptError.message);
        setLoading(false);
        return;
      }

      console.log("CURRENT USER:", user.id);
      console.log("QUESTIONS:", questionData);
      console.log("ATTEMPTS:", attemptData);

      const attempts: Attempt[] = attemptData ?? [];

      /*
       * Find the most recent attempt for each question.
       *
       * Because attempts are ordered newest first,
       * the first attempt we encounter for each
       * question is its latest result.
       */
      const latestAttempt = new Map<number, Attempt>();

      for (const attempt of attempts) {
        if (!latestAttempt.has(attempt.question_id)) {
          latestAttempt.set(attempt.question_id, attempt);
        }
      }

      /*
       * Questions never attempted before.
       */
      const neverAttempted = questionData.filter(
        (question) => !latestAttempt.has(question.id)
      );

      /*
       * Questions previously answered incorrectly.
       */
      const previouslyIncorrect = questionData.filter(
        (question) =>
          latestAttempt.get(question.id)?.correct === false
      );

      /*
       * Questions previously answered correctly.
       */
      const previouslyCorrect = questionData.filter(
        (question) =>
          latestAttempt.get(question.id)?.correct === true
      );

      /*
       * Learning order:
       *
       * 1. Never attempted
       * 2. Previously incorrect
       * 3. Previously correct
       */
      const selectedQuestions = [
        ...neverAttempted,
        ...previouslyIncorrect,
        ...previouslyCorrect,
      ];

      setQuestions(selectedQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setSubmitted(false);

      setLoading(false);
    }

    loadQuestions();
  }, []);

  async function checkAnswer() {
    if (!selectedAnswer || saving) {
      return;
    }

    const question = questions[currentIndex];

    if (!question) {
      return;
    }

    const correct =
      selectedAnswer === question.correct_answer;

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "You must be logged in to save your progress."
      );

      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: selectedAnswer,
        correct,
      });

    if (saveError) {
      console.error("Attempt save error:", saveError);

      setError(
        "Your answer could not be saved. Please try again."
      );

      setSaving(false);
      return;
    }

    setSubmitted(true);
    setSaving(false);
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setSubmitted(false);
    setError("");

    setCurrentIndex((index) => index + 1);
  }

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">
          <p>Loading questions...</p>
        </div>
      </main>
    );
  }

  /*
   * Error screen
   */
  if (error && questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">
            Core Duties
          </h1>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load questions
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * No questions
   */
  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <h1 className="text-3xl font-bold">
              No questions available
            </h1>

            <p className="mt-3 text-gray-600">
              There are currently no questions available
              for Core Duties.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Finished the current set
   */
  if (currentIndex >= questions.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              🎉
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Core Duties complete!
            </h1>

            <p className="mt-3 text-gray-600">
              You have completed this practice set
              of {questions.length} questions.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Practise again
            </button>

          </div>
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];

  const options = [
    {
      letter: "A" as const,
      text: question.option_a,
    },
    {
      letter: "B" as const,
      text: question.option_b,
    },
    {
      letter: "C" as const,
      text: question.option_c,
    },
    {
      letter: "D" as const,
      text: question.option_d,
    },
  ];

  const isCorrect =
    selectedAnswer === question.correct_answer;

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          BPC · Professional Ethics
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Core Duties
        </h1>

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm text-gray-500">
            <span>
              Question {currentIndex + 1} of{" "}
              {questions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <h2 className="text-xl font-semibold leading-relaxed">
            {question.question}
          </h2>

          <div className="mt-8 space-y-3">

            {options.map((option) => {
              const selected =
                selectedAnswer === option.letter;

              const correct =
                option.letter ===
                question.correct_answer;

              let classes =
                "border-gray-200 hover:border-blue-400 hover:bg-blue-50";

              if (!submitted && selected) {
                classes =
                  "border-blue-500 bg-blue-50 ring-2 ring-blue-200";
              }

              if (submitted && correct) {
                classes =
                  "border-green-500 bg-green-50";
              }

              if (
                submitted &&
                selected &&
                !correct
              ) {
                classes =
                  "border-red-500 bg-red-50";
              }

              return (
                <button
                  key={option.letter}
                  type="button"
                  disabled={
                    submitted || saving
                  }
                  onClick={() =>
                    setSelectedAnswer(
                      option.letter
                    )
                  }
                  className={`w-full rounded-xl border p-4 text-left transition ${classes}`}
                >
                  <span className="mr-4 font-bold">
                    {option.letter}.
                  </span>

                  {option.text}
                </button>
              );
            })}

          </div>

          {!submitted && (
            <button
              type="button"
              disabled={
                !selectedAnswer || saving
              }
              onClick={checkAnswer}
              className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Check answer"}
            </button>
          )}

          {submitted && (
            <div
              className={`mt-8 rounded-xl p-6 ${
                isCorrect
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >

              <h3 className="text-lg font-bold">
                {isCorrect
                  ? "✓ Correct!"
                  : "✗ Not quite"}
              </h3>

              {!isCorrect && (
                <p className="mt-2">
                  The correct answer is{" "}
                  <strong>
                    {question.correct_answer}
                  </strong>
                  .
                </p>
              )}

              {question.explanation && (
                <div className="mt-4">

                  <p className="font-semibold">
                    Explanation
                  </p>

                  <p className="mt-2 leading-relaxed">
                    {question.explanation}
                  </p>

                </div>
              )}

              {currentIndex <
              questions.length - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700"
                >
                  Finish →
                </button>
              )}

            </div>
          )}

        </div>
      </div>
    </main>
  );
}