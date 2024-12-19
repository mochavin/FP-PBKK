import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Board, User } from "@/app/types/board";

export function useBoardsPageData() {
  const {
    data: boards,
    error: boardsError,
    isLoading: boardsLoading,
  } = useSWR<Board[]>("/board/", fetcher);
  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
  } = useSWR<User[]>("/board/users", fetcher);

  const isLoading = boardsLoading || usersLoading;
  const error = boardsError || usersError;

  return { boards, users, error, isLoading };
}