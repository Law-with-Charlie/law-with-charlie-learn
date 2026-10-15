"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SiteHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();

    window.location.href = "/";
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="flex items-center"
          aria-label="Law with Charlie Learn home"
        >
          <Image
            src="/logo.png"
            alt="Law with Charlie"
            width={360}
            height={120}
            className="h-24 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-8">

          <Link
            href="/courses"
            className="font-medium text-gray-700 transition hover:text-black"
          >
            Courses
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className="font-medium text-gray-700 transition hover:text-black"
              >
                Dashboard
              </Link>

              <Link
                href="/progress"
                className="font-medium text-gray-700 transition hover:text-black"
              >
                Progress
              </Link>

              <Link
                href="/account"
                className="font-medium text-gray-700 transition hover:text-black"
              >
                Account
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="font-medium text-gray-700 transition hover:text-red-600"
              >
                Sign out
              </button>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}

        </div>
      </nav>
    </header>
  );
}