"use client";
import React from "react";
import BoardList from "./BoardList";
import { fetcher } from "@/lib/api";
import useSWR from "swr";
import { Board, User } from "@/app/types/board";
import { LoadingState } from "@/components/LoadingState";

const BoardsPage: React.FC = () => {
  const {
    data: boards,
    error,
    isLoading,
  } = useSWR<Board[]>("/board/", fetcher);
  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
  } = useSWR<User[]>("/board/users", fetcher);

  if (error) return <div>Failed to load boards</div>;
  if (usersError) return <div>Failed to load users</div>;
  if (isLoading || usersLoading) return <LoadingState />;

  return <BoardList boards={boards || []} users={users || []} />;
};

export default BoardsPage;
