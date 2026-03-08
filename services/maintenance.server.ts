"use server";

import { AxiosError } from "axios";
import type { ApiResponse } from "@/lib/api";
import type {
  PaginatedMaintenancesResponse,
  IMaintenanceResponse,
} from "./maintenance";
import { axiosServer } from "@/lib/axiosServer";

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

async function getAxiosInstance() {
  return await axiosServer();
}

/**
 * Fetch maintenance requests for the current user with optional pagination
 */
export async function getMaintenances(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<PaginatedMaintenancesResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<PaginatedMaintenancesResponse>
    >("/maintenance", { params });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error("Get maintenances error:", {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }
    if (axiosError.response?.status === 403) {
      throw new Error(
        "You don't have permission to view maintenance requests.",
      );
    }

    throw new Error(
      errorData?.message ||
        axiosError.message ||
        "Failed to fetch maintenance requests.",
    );
  }
}

/**
 * Fetch a single maintenance request by ID
 */
export async function getMaintenanceById(
  id: string,
): Promise<ApiResponse<IMaintenanceResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<ApiResponse<IMaintenanceResponse>>(
      `/maintenance/${id}`,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error(`Get maintenance ${id} error:`, {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Maintenance request not found.");
    }

    throw new Error(
      errorData?.message ||
        axiosError.message ||
        "Failed to fetch maintenance request.",
    );
  }
}
