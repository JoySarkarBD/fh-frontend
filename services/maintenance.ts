import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

// Enum matching backend
export enum MaintenanceStatus {
  PENDING = "PENDING",
  DONE = "DONE",
}

// Maintenance item interface - matches backend schema
export interface IMaintenanceResponse {
  _id?: string;
  id: string;
  amenities: string;
  task: string;
  reminderDate: string;
  description: string;
  status: MaintenanceStatus;
  user?: string;
  createdAt: string;
  updatedAt: string;
}

// Create maintenance DTO - matches backend CreateMaintenanceDto
export interface ICreateMaintenance {
  amenities: string;
  task: string;
  reminderDate: string; // Will be sent as string, backend converts to Date
  description: string;
  status?: MaintenanceStatus;
}

// Update maintenance DTO - matches backend UpdateMaintenanceDto
export interface IUpdateMaintenance {
  amenities?: string;
  task?: string;
  reminderDate?: string;
  description?: string;
  status?: MaintenanceStatus;
}

// Pagination meta
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  search?: string;
}

// API response for paginated maintenances
export interface PaginatedMaintenancesResponse {
  maintenances: IMaintenanceResponse[];
  pagination: Meta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Creates a new maintenance request
 */
export const createMaintenance = async (
  data: ICreateMaintenance,
): Promise<ApiResponse<IMaintenanceResponse>> => {
  try {
    const response = await axiosClient.post<ApiResponse<IMaintenanceResponse>>(
      "/maintenance",
      data,
    );

    console.log("Maintenance created successfully:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Create maintenance error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    // Handle validation errors (usually 422)
    if (axiosError.response?.status === 422) {
      const validationErrors = axiosError.response.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");

        throw new Error(
          errorMessages || "Validation failed. Please check your input.",
        );
      }
    }

    // Handle other HTTP errors
    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }

    if (axiosError.response?.status === 403) {
      throw new Error(
        "You don't have permission to create maintenance requests.",
      );
    }

    // Handle network errors
    if (axiosError.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    if (axiosError.code === "ERR_NETWORK") {
      throw new Error("Network error. Please check your internet connection.");
    }

    // Generic error with server message if available
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to create maintenance request. Please try again.",
    );
  }
};

/**
 * Get all maintenance requests for the current user with pagination
 */
export const getMaintenances = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<PaginatedMaintenancesResponse>> => {
  try {
    const response = await axiosClient.get<
      ApiResponse<PaginatedMaintenancesResponse>
    >("/maintenance", { params });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Get maintenances error:", {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch maintenance requests.",
    );
  }
};

/**
 * Get single maintenance request by ID
 */
export const getMaintenanceById = async (
  id: string,
): Promise<ApiResponse<IMaintenanceResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<IMaintenanceResponse>>(
      `/maintenance/${id}`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error(`Get maintenance ${id} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Maintenance request not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch maintenance request.",
    );
  }
};

/**
 * Update a maintenance request
 */
export const updateMaintenance = async (
  id: string,
  data: IUpdateMaintenance,
): Promise<ApiResponse<IMaintenanceResponse>> => {
  try {
    const response = await axiosClient.patch<ApiResponse<IMaintenanceResponse>>(
      `/maintenance/${id}`,
      data,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error(`Update maintenance ${id} error:`, {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Maintenance request not found.");
    }

    if (axiosError.response?.status === 422) {
      const validationErrors = axiosError.response.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");

        throw new Error(errorMessages);
      }
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update maintenance request.",
    );
  }
};

/**
 * Delete a maintenance request
 */
export const deleteMaintenance = async (
  id: string,
): Promise<ApiResponse<IMaintenanceResponse>> => {
  try {
    const response = await axiosClient.delete<
      ApiResponse<IMaintenanceResponse>
    >(`/maintenance/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error(`Delete maintenance ${id} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Maintenance request not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete maintenance request.",
    );
  }
};
