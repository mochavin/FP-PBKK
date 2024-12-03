"use client";
import React from "react";
import BoardList from "./BoardList";
import { fetcher } from "@/lib/api";
import useSWR from "swr";
import { Board } from "@/app/types/board";
import { LoadingState } from "@/components/LoadingState";

const BoardsPage: React.FC = () => {
  const { data: boards, error, isLoading } = useSWR<Board[]>("/board/", fetcher);

  if (error) return <div>Failed to load boards</div>;
  if (isLoading) return <LoadingState />;

  return <BoardList boards={boards || []} />;
};

export default BoardsPage;
