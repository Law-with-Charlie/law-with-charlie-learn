"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Topic = {
  id: number;
  subject_id: number;
  name: string;
  description: string | null;
  slug: string;
};

type Subject = {
  id: number;
  name: string;
  slug: string;
};

type Question = {
  id: number;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  correct_answer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  difficulty: number;
  question_type: string | null;
  exam_tip: string | null;
};

type Attempt = {
  question_id: number;
  correct: boolean;
  created_at: string;
};

export default function TopicPage() {
  const params = useParams();

  const subjectSlug = params.subject as string;
  const topicSlug = params.topic as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAnswer, setSelectedAnswer] = useState<
    "A" | "B" | "C" | "D" | "E" | null
  >(null);

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError("");

      // --------------------------------------------------
      // Get the currently signed-in user
      // --------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to practise.");
        setLoading(false);
        return;
      }

      // --------------------------------------------------
      // Load the subject
      // --------------------------------------------------

      const {
        data: subjectData,
        error: subjectError,
      } = await supabase
        .from("subjects")
        .select("id, name, slug")
        .eq("slug", subjectSlug)
        .single();

      if (subjectError || !subjectData) {
        console.error("Subject error:", subjectError);

        setError("The subject could not be found.");
        setLoading(false);
        return;
      }

      setSubject(subjectData);

      // --------------------------------------------------
      // Load the topic
      // --------------------------------------------------

      const {
        data: topicData,
        error: topicError,
      } = await supabase
        .from("topics")
        .select("id, subject_id, name, description, slug")
        .eq("subject_id", subjectData.id)
        .eq("slug", topicSlug)
        .single();

      if (topicError || !topicData) {
        console.error("Topic error:", topicError);

        setError("The topic could not be found.");
        setLoading(false);
        return;
      }

      setTopic(topicData);

      // --------------------------------------------------
      // Load all questions for this topic
      // --------------------------------------------------

      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from("questions")
        .select("*")
        .eq("topic_id", topicData.id)
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

      // --------------------------------------------------
      // Load this user's previous attempts
      // --------------------------------------------------

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

      const attempts: Attempt[] = attemptData ?? [];

      // --------------------------------------------------
      // Find the most recent attempt for each question
      // --------------------------------------------------

      const latestAttempt = new Map<number, Attempt>();

      for (const attempt of attempts) {
        if (!latestAttempt.has(attempt.question_id)) {
          latestAttempt.set(attempt.question_id, attempt);
        }
      }

      // --------------------------------------------------
      // Organise questions into learning order
      //
      // 1. Never attempted
      // 2. Previously incorrect
      // 3. Previously correct
      // --------------------------------------------------

      const neverAttempted = questionData.filter(
        (question) => !latestAttempt.has(question.id)
      );

      const previouslyIncorrect = questionData.filter(
        (question) =>
          latestAttempt.get(question.id)?.correct === false
      );

      const previouslyCorrect = questionData.filter(
        (question) =>
          latestAttempt.get(question.id)?.correct === true
      );

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
  }, [subjectSlug, topicSlug]);

  // --------------------------------------------------
  // Check answer
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Next question
  // --------------------------------------------------

  function nextQuestion() {
    setSelectedAnswer(null);
    setSubmitted(false);
    setError("");

    setCurrentIndex((index) => index + 1);
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">
          <p>Loading questions...</p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error && questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">

          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            BPC
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {topic?.name ?? "Topic"}
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

  // --------------------------------------------------
  // No questions
  // --------------------------------------------------

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
              for {topic?.name ?? "this topic"}.
            </p>

          </div>

        </div>

      </main>
    );
  }

  // --------------------------------------------------
  // Finished
  // --------------------------------------------------

  if (currentIndex >= questions.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              🎉
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              {topic?.name} complete!
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

  // --------------------------------------------------
  // Options
  // --------------------------------------------------

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
    {
      letter: "E" as const,
      text: question.option_e,
    },
  ].filter((option) => option.text);

  const isCorrect =
    selectedAnswer === question.correct_answer;

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-3xl">

        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          BPC · {subject?.name}
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {topic?.name}
        </h1>

        {topic?.description && (
          <p className="mt-3 text-gray-600">
            {topic.description}
          </p>
        )}

        {/* Progress */}

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

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Question */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {question.question_type && (
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {question.question_type}
            </p>
          )}

          <h2 className="mt-3 text-xl font-semibold leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}

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

          {/* Check answer */}

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

          {/* Result */}

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

              {/* Explanation */}

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

              {/* Exam tip */}

              {question.exam_tip && (
                <div className="mt-5 rounded-lg bg-white/70 p-4">

                  <p className="font-semibold">
                    Exam tip
                  </p>

                  <p className="mt-2 text-sm leading-relaxed">
                    {question.exam_tip}
                  </p>

                </div>
              )}

              {/* Continue */}

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