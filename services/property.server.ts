import { AxiosError } from "axios";
import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/lib/api";
import type { IPropertyResponse, PaginatedPropertiesResponse } from "./property";

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Fetch properties owned by the current user with optional pagination
 */
export async function getOwnProperties(
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<PaginatedPropertiesResponse>> {
  try {
    const response = await axiosClient.get<ApiResponse<PaginatedPropertiesResponse>>(
      "/property/me",
      { params }
    );

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
      errorData?.message || axiosError.message || "Failed to fetch your properties."
    );
  }
}