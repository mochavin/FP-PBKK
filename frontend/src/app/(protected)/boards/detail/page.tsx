"use client";
import React, { Suspense } from "react";
import KanbanPage from "./KanbanPage";
import { LoadingState } from "@/components/LoadingState";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <KanbanPage />
    </Suspense>
  );
}
