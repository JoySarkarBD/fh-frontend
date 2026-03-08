import {
  DashboardStatsResponse,
  getAdminDashboardStats,
  UsersResponse,
} from "@/services/user";
import { getAllUsers } from "@/services/user";
import axiosClient from "@/lib/axiosClient";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/user";

/**
 * Hook for fetching the current user's profile information using the client-side axios instance.
 *
 * @returns A React Query object containing the user's profile data, loading state, and error information.
 */
export const useGetUser = () => {
  return useQuery({
    queryKey: ["subscriptions", "users"],
    queryFn: () => axiosClient.get("/users/me"),
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
    placeholderData: keepPreviousData,
    retry: 1,
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

/**
 * Admin-only: get user by id
 */
export const useGetUserById = (id?: string) => {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () =>
      id ? getUserById(id) : Promise.reject("No user id provided"),
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useAdminDashboardStats = () => {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
