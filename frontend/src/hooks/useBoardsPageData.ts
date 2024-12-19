import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Board, User } from "@/app/types/board";

export function useBoardsPageData() {
  const {
    data: boards,
    error: boardsError,
    isLoading: boardsLoading,
  } = useSWR<Board[]>("/board/", fetcher);

  const isLoading = boardsLoading;
  const error = boardsError;

  return { boards, error, isLoading };
}
