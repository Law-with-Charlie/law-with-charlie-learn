"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center font-medium text-gray-600 transition hover:text-black"
    >
      ← Back
    </button>
  );
}