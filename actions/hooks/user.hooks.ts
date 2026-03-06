

import { getUserClient, UsersResponse } from "@/services/user";
import { getAllUsers } from "@/services/user";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook for fetching the current user's profile information using the client-side axios instance.
 *
 * @returns A React Query object containing the user's profile data, loading state, and error information.
 */
export const useGetUser = () => {
  return useQuery({
    queryKey: ["subscriptions", "users"],
    queryFn: getUserClient,
    staleTime: 60 * 1000, // 1 min
  });
};

/**
 * Admin-only: all users list with pagination
 */
export const useGetAllUsersAdmin = (
  page: number = 1,
  limit: number = 10,
  search: string = "",
) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["admin-users", page, limit, search],
    queryFn: () => getAllUsers({ page, limit, search }),
    staleTime: 60 * 1000,
    retry: 1,
    // Optional: if you want to disable when not admin → later add condition
    // enabled: isAdmin === true,
    select: (data): UsersResponse => ({
      users: data.users ?? [],
      pagination: data.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        count: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),
  });
};
