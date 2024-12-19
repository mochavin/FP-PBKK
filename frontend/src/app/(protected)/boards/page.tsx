"use client";
import React from "react";
import BoardList from "./BoardList";
import { LoadingState } from "@/components/LoadingState";
import { useBoardsPageData } from "@/hooks/useBoardsPageData";

const BoardsPage: React.FC = () => {
  const { boards, error, isLoading } = useBoardsPageData();

  if (error) {
    return <div>Failed to load boards and users: {error.message}</div>;
  }
  if (isLoading) return <LoadingState />;

  return <BoardList boards={boards || []} />;
};

export default BoardsPage;
