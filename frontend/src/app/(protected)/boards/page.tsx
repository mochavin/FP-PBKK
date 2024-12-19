"use client";
import React from "react";
import BoardList from "./BoardList";
import { useBoardsPageData } from "./useBoardsPageData";
import { LoadingState } from "@/components/LoadingState";

const BoardsPage: React.FC = () => {
  const { boards, users, error, isLoading } = useBoardsPageData();

  if (error) {
    return <div>Failed to load boards and users: {error.message}</div>;
  }
  if (isLoading) return <LoadingState />;

  return <BoardList boards={boards || []} users={users || []} />;
};

export default BoardsPage;
