"use server";
import axiosClient from "@/lib/axiosClient";
import { axiosServer } from "@/lib/axiosServer";
import { AxiosError } from "axios";

export type UsersResponse = {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    count: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type DashboardStatsResponse = {
  totalUsers: number;
  thisMonthUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  pendingCommunication: number;
  conversionRate: number;
  revenueTrend: Array<{ month: string; revenue: number }>;
  sellingOverview: Array<{ month: string; sales: number }>;
  userDistribution: {
    subscribed: number;
    unsubscribed: number;
  };
};
interface ApiErrorResponse {
  message?: string;
  success?: boolean;
}

type GetAllUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type AdminUser = {
  _id?: string;
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  homeAddress?: string;
  officeAddress?: string;
  address?: string;
  isSubscribed?: boolean;
  propertiesOwn?: number;
  propertiesBuy?: number;
  propertiesSell?: number;
  [key: string]: unknown;
};

/**
 * Fetches the current user's profile information from the server using the client-side axios instance.
 *
 * @returns A promise that resolves to the user's profile data.
 * @throws An error if the request fails, with details logged to the console for debugging.
 */
export const getUserClient = async () => {
  const resp = axiosClient.get("/users/me");
  return resp;
};

// Initialize axios server

async function getAxiosInstance() {
  return await axiosServer();
}

/**
 * Get All Users as an Admin Only
 * This function is intended to be used by admin users to fetch a list of all registered users from the backend.
 *
 * @returns A promise that resolves to an array of user profiles.
 * @throws An error if the request fails, with details logged to the console for debugging.
 */

export const getAllUsers = async (
  params: GetAllUsersParams = {},
): Promise<UsersResponse> => {
  try {
    const axiosInstance = await getAxiosInstance();
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: UsersResponse;
    }>("/users", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search ?? "",
      },
    });

    if (!data.success || !data.data) {
      throw new Error("Invalid response format from /users");
    }

    return data.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    throw new Error(
      error.response?.data?.message ||
        (error.message === "Network Error"
          ? "Request blocked. Check backend CORS origin settings."
          : "Failed to load users list"),
    );
  }
};

/**
 * Get a user by ID (admin only)
 * @param id - User ID
 * @returns User profile data
 */
export const getUserById = async (id: string) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: AdminUser;
    }>(`/users/${id}`);
    if (!data.success || !data.data) {
      throw new Error("Invalid response format from /users/:id");
    }
    return data.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(
      error.response?.data?.message ||
        (error.message === "Network Error"
          ? "Request blocked. Check backend CORS origin settings."
          : "Failed to load user details"),
    );
  }
};

export const getAdminDashboardStats =
  async (): Promise<DashboardStatsResponse> => {
    try {
      const axiosInstance = await getAxiosInstance();
      const { data } = await axiosInstance.get<{
        success: boolean;
        data: DashboardStatsResponse;
      }>("/users/admin/dashboard-stats");

      if (!data.success || !data.data) {
        throw new Error(
          "Invalid response format from /users/admin/dashboard-stats",
        );
      }

      return data.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      throw new Error(
        error.response?.data?.message ||
          (error.message === "Network Error"
            ? "Request blocked. Check backend CORS origin settings."
            : "Failed to load dashboard stats"),
      );
    }
  };
