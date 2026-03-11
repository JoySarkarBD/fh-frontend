"use server";

import type { ApiResponse } from "@/lib/api";
import { axiosServer } from "@/lib/axiosServer";
import { AxiosError } from "axios";
import type { PaginatedPropertiesResponse } from "./property";

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

async function getAxiosInstance() {
  return await axiosServer();
}

/**
 * Fetch properties owned by the current user with optional pagination
 */
export async function getOwnProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedPropertiesResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<PaginatedPropertiesResponse>
    >("/property/me", { params });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Explicitly cast response.data to ApiErrorResponse
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error("Get own properties error:", {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });

    throw new Error(
      errorData?.message ||
        axiosError.message ||
        "Failed to fetch your properties.",
    );
  }
}

/**
 * Fetch all properties with optional pagination and search (for admin only)
 *
 * @param params - Optional query parameters for pagination and search
 * @returns A paginated list of properties matching the search criteria
 * @throws Error if the request fails or if the user is not authorized
 */
export async function getAllProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<PaginatedPropertiesResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<PaginatedPropertiesResponse>
    >("/property", { params });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error("Get all properties error:", {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });
    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }
    if (axiosError.response?.status === 403) {
      throw new Error("You don't have permission to view all properties.");
    }
    throw new Error(
      errorData?.message || axiosError.message || "Failed to fetch properties.",
    );
  }
}
