import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function getAdminClient(request: NextRequest) {
  if (!supabaseUrl || !publishableKey) {
    return { error: Response.json({ error: "Supabase is not configured." }, { status: 500 }) };
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: Response.json({ error: "Sign in required." }, { status: 401 }) };

  const client = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return { error: Response.json({ error: "Your session is invalid or expired." }, { status: 401 }) };
  if (data.user.app_metadata?.role !== "admin") return { error: Response.json({ error: "Administrator access required." }, { status: 403 }) };
  return { client };
}

export async function GET(request: NextRequest) {
  const access = await getAdminClient(request);
  if ("error" in access) return access.error;

  const [subjects, topics, questions] = await Promise.all([
    access.client.from("subjects").select("id, name").order("name"),
    access.client.from("topics").select("id, name, slug, subject_id").order("name"),
    access.client.from("questions").select("id, topic_id, question, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation, exam_tip, difficulty, question_type").order("id", { ascending: false }),
  ]);
  const failed = subjects.error ?? topics.error ?? questions.error;
  if (failed) return Response.json({ error: `Unable to load question library: ${failed.message}` }, { status: 403 });
  return Response.json({ subjects: subjects.data ?? [], topics: topics.data ?? [], questions: questions.data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const access = await getAdminClient(request);
  if ("error" in access) return access.error;

  let body: { action?: string; id?: number; question?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action === "delete" && Number.isInteger(body.id)) {
    const { error } = await access.client.from("questions").delete().eq("id", body.id!);
    if (error) return Response.json({ error: error.message }, { status: 403 });
    return Response.json({ ok: true });
  }

  if (body.action === "save" && body.question && Number.isInteger(body.question.topic_id) && typeof body.question.question === "string" && body.question.question.trim()) {
    const { id, ...values } = body.question;
    const query = Number.isInteger(id)
      ? access.client.from("questions").update(values).eq("id", id as number)
      : access.client.from("questions").insert(values);
    const { error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 403 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Invalid question operation." }, { status: 400 });
}
