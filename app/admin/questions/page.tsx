"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Topic = { id: number; name: string; slug: string; subject_id: number };
type Subject = { id: number; name: string };
type Question = {
  id: number;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  correct_answer: string;
  explanation: string | null;
  exam_tip: string | null;
  difficulty: number;
  question_type: string | null;
};

type QuestionDraft = Omit<Question, "id">;

const emptyDraft: QuestionDraft = {
  topic_id: 0,
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  option_e: "",
  correct_answer: "A",
  explanation: "",
  exam_tip: "",
  difficulty: 1,
  question_type: "",
};

const columns = ["A", "B", "C", "D", "E"] as const;

function isAdmin(user: User | null) {
  return user?.app_metadata?.role === "admin";
}

async function adminRequest(body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in again to continue.");
  const response = await fetch("/api/admin/questions", {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}

export default function QuestionAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!isAdmin(user)) return;
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest();
      setSubjects(data.subjects ?? []);
      setTopics(data.topics ?? []);
      setQuestions(data.questions ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load question library.");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void loadData(); }, [loadData]);

  const visibleTopics = useMemo(() => subjectFilter === "all"
    ? topics
    : topics.filter((topic) => topic.subject_id === Number(subjectFilter)), [topics, subjectFilter]);

  const visibleQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return questions.filter((question) => {
      const topic = topics.find((item) => item.id === question.topic_id);
      const subjectMatches = subjectFilter === "all" || topics.some((item) => item.id === question.topic_id && item.subject_id === Number(subjectFilter));
      const topicMatches = topicFilter === "all" || question.topic_id === Number(topicFilter);
      return subjectMatches && topicMatches && (!query || question.question.toLowerCase().includes(query) || topic?.name.toLowerCase().includes(query));
    });
  }, [questions, topics, search, subjectFilter, topicFilter]);

  function startEdit(question: Question) {
    const questionTopic = topics.find((topic) => topic.id === question.topic_id);
    setFormSubjectId(questionTopic ? String(questionTopic.subject_id) : "");
    setEditingId(question.id);
    setDraft({ ...question, option_e: question.option_e ?? "", explanation: question.explanation ?? "", exam_tip: question.exam_tip ?? "", question_type: question.question_type ?? "" });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    const firstSubjectId = subjects[0]?.id ?? 0;
    setFormSubjectId(firstSubjectId ? String(firstSubjectId) : "");
    setEditingId(null);
    setDraft({ ...emptyDraft, topic_id: topics.find((topic) => topic.subject_id === firstSubjectId)?.id ?? 0 });
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin(user)) return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...draft,
      option_e: draft.option_e?.trim() || null,
      explanation: draft.explanation?.trim() || null,
      exam_tip: draft.exam_tip?.trim() || null,
      question_type: draft.question_type?.trim() || null,
      difficulty: Number(draft.difficulty),
    };
    try {
      await adminRequest({ action: "save", question: { ...payload, ...(editingId ? { id: editingId } : {}) } });
    } catch (cause) {
      setError(`Could not save question. Check the database policy and required fields. ${cause instanceof Error ? cause.message : "Request failed."}`);
      setSaving(false);
      return;
    }
    setSaving(false);
    setNotice(editingId ? "Question updated." : "Question added.");
    resetForm();
    await loadData();
  }

  async function deleteQuestion(question: Question) {
    if (!isAdmin(user) || !window.confirm("Delete this question permanently?")) return;
    setError("");
    setNotice("");
    try {
      await adminRequest({ action: "delete", id: question.id });
      setNotice("Question deleted.");
      await loadData();
    } catch (cause) {
      setError(`Could not delete question. ${cause instanceof Error ? cause.message : "Request failed."}`);
    }
  }

  if (authLoading) return <main className="min-h-screen px-6 py-16"><p className="mx-auto max-w-6xl text-gray-600">Checking access…</p></main>;
  if (!user) return <main className="min-h-screen bg-gray-50 px-6 py-16"><div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Question library</p><h1 className="mt-2 text-3xl font-bold">Sign in required</h1><p className="mt-3 text-gray-600">Sign in with an administrator account to manage questions.</p><Link className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white" href="/login">Go to sign in</Link></div></main>;
  if (!isAdmin(user)) return <main className="min-h-screen bg-gray-50 px-6 py-16"><div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Question library</p><h1 className="mt-2 text-3xl font-bold">Administrator access only</h1><p className="mt-3 text-gray-600">This account does not have the administrator role required for this area.</p><Link className="mt-6 inline-block font-semibold text-blue-700 hover:underline" href="/courses">Return to courses →</Link></div></main>;

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Content management</p><h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Question library</h1><p className="mt-2 text-gray-600">Create, review and maintain practice questions.</p></div>
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-600"><span className="font-semibold text-gray-950">{questions.length}</span> questions <span className="mx-2 text-gray-300">·</span><span className="font-semibold text-gray-950">{topics.length}</span> topics</div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-950">{editingId ? "Edit question" : "Add a question"}</h2><p className="mt-1 text-sm text-gray-500">Use the existing five-option question format.</p></div>{editingId && <button type="button" onClick={resetForm} className="text-sm font-semibold text-gray-600 hover:text-gray-950">Cancel edit</button>}</div>
          <form onSubmit={saveQuestion} className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">Question text<textarea required rows={3} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
            <label className="text-sm font-semibold text-gray-700">Subject<select value={formSubjectId} onChange={(e) => { const selected = e.target.value; setFormSubjectId(selected); setDraft({ ...draft, topic_id: topics.find((topic) => topic.subject_id === Number(selected))?.id ?? 0 }); }} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal"><option value="">Choose subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <label className="text-sm font-semibold text-gray-700">Topic<select required value={draft.topic_id || ""} onChange={(e) => setDraft({ ...draft, topic_id: Number(e.target.value) })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal"><option value="" disabled>Select a topic</option>{topics.filter((topic) => formSubjectId && topic.subject_id === Number(formSubjectId)).map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label>
            {columns.map((letter) => {
              const key = `option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d" | "option_e";
              return <label key={letter} className="text-sm font-semibold text-gray-700">Option {letter}{letter === "E" && <span className="ml-1 font-normal text-gray-400">(optional)</span>}<textarea required={letter !== "E"} rows={2} value={draft[key] ?? ""} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>;
            })}
            <label className="text-sm font-semibold text-gray-700">Correct answer<select value={draft.correct_answer} onChange={(e) => setDraft({ ...draft, correct_answer: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal">{columns.filter((letter) => letter !== "E" || draft.option_e?.trim()).map((letter) => <option key={letter} value={letter}>{letter}</option>)}</select></label>
            <label className="text-sm font-semibold text-gray-700">Difficulty<select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal"><option value={1}>1 · Introductory</option><option value={2}>2 · Developing</option><option value={3}>3 · Advanced</option></select></label>
            <label className="text-sm font-semibold text-gray-700">Question type <span className="font-normal text-gray-400">(optional)</span><input value={draft.question_type ?? ""} onChange={(e) => setDraft({ ...draft, question_type: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" placeholder="e.g. Single best answer" /></label>
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">Explanation<textarea rows={3} value={draft.explanation ?? ""} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">Exam tip <span className="font-normal text-gray-400">(optional)</span><textarea rows={2} value={draft.exam_tip ?? ""} onChange={(e) => setDraft({ ...draft, exam_tip: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" /></label>
            <div className="flex items-center gap-3 md:col-span-2"><button disabled={saving || topics.length === 0} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : editingId ? "Save changes" : "Add question"}</button>{topics.length === 0 && !loading && <span className="text-sm text-amber-700">Topics could not be loaded. Check read access.</span>}</div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-bold text-gray-950">All questions</h2><p className="mt-1 text-sm text-gray-500">{visibleQuestions.length} matching {visibleQuestions.length === 1 ? "question" : "questions"}</p></div><div className="grid gap-3 sm:grid-cols-3"><input aria-label="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question or topic" className="rounded-lg border border-gray-300 px-3 py-2 text-sm"/><select aria-label="Filter by subject" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setTopicFilter("all"); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"><option value="all">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><select aria-label="Filter by topic" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"><option value="all">All topics</option>{visibleTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></div></div>
          {loading ? <p className="p-8 text-center text-gray-500">Loading question library…</p> : visibleQuestions.length === 0 ? <p className="p-8 text-center text-gray-500">No questions match these filters.</p> : <div className="divide-y divide-gray-100">{visibleQuestions.map((question) => { const topic = topics.find((item) => item.id === question.topic_id); const subject = subjects.find((item) => item.id === topic?.subject_id); return <article key={question.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">{subject?.name ?? "Subject"} <span className="text-gray-400">/</span> {topic?.name ?? "Topic"} <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-gray-600">Level {question.difficulty}</span></p><h3 className="font-semibold leading-relaxed text-gray-950">{question.question}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-500">A: {question.option_a} · B: {question.option_b} · C: {question.option_c} · D: {question.option_d}{question.option_e ? ` · E: ${question.option_e}` : ""}</p><p className="mt-1 text-xs text-gray-500">Answer: <span className="font-semibold text-gray-700">{question.correct_answer}</span>{question.question_type ? ` · ${question.question_type}` : ""}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => startEdit(question)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Edit</button><button type="button" onClick={() => void deleteQuestion(question)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button></div></article>; })}</div>}
        </section>
      </div>
    </main>
  );
}
