"use server";

import { AxiosError } from "axios";
import type { ApiResponse } from "@/lib/api";
import type { PaginatedDocumentsResponse, IDocumentResponse } from "./document";
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
 * Fetch documents for the current user with optional pagination
 */
export async function getDocuments(params?: {
  page?: number;
  limit?: number;
  propertyId?: string;
}): Promise<ApiResponse<PaginatedDocumentsResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<PaginatedDocumentsResponse>
    >("/document", { params });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error("Get documents error:", {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }
    if (axiosError.response?.status === 403) {
      throw new Error("You don't have permission to view documents.");
    }

    throw new Error(
      errorData?.message || axiosError.message || "Failed to fetch documents.",
    );
  }
}

/**
 * Fetch a single document by ID
 */
export async function getDocumentById(
  id: string,
): Promise<ApiResponse<IDocumentResponse>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<ApiResponse<IDocumentResponse>>(
      `/document/${id}`,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data as ApiErrorResponse | undefined;

    console.error(`Get document ${id} error:`, {
      message: axiosError.message,
      response: errorData,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Document not found.");
    }

    throw new Error(
      errorData?.message || axiosError.message || "Failed to fetch document.",
    );
  }
}
