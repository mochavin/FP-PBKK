import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { User } from "@/app/types/board";

export function useUsers(isOpen: boolean) {
  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
  } = useSWR<User[]>(isOpen ? "/board/users" : null, fetcher);

  const isLoading = usersLoading;
  const error = usersError;

  if (!users) {
    return { users: [], error, isLoading };
  }
  return { users, error, isLoading };
}
