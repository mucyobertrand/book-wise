"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="error-fallback">
        <h2>Something went wrong</h2>
        <p className="mb-4">{error.message || "Unexpected error on All Books"}</p>
        <Button className="view-btn px-3 py-2" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </section>
  );
}
