"use server";
import { axiosServer } from "@/lib/axiosServer";
import { AxiosError } from "axios";

// ============================================================================
// Types (matching your backend schema)
// ============================================================================

export enum NotificationSettingsTitle {
  ALERT = "New Listing Alerts",
  REMINDER = "Open House Reminders",
  ACTIVITY = "Favorites Activity",
  LIVE = "Listing Live Notification",
  MARKET = "Market Updates",
  DOCUMENT_REMINDERS = "Document Submission Reminders",
  USER_REPORT = "User Reports",
  MODERATION = "Listing Moderation",
}

// This matches your NotificationType from notification.schema
export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

// Interface for Notification Settings (matching your schema)
export interface INotificationSettings {
  _id?: string;
  id: string;
  name: NotificationType;
  title: NotificationSettingsTitle;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// DTO for updating notification settings
export interface IUpdateNotificationSettings {
  isActive: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error response interface
export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getAxiosInstance() {
  return await axiosServer();
}

// ============================================================================
// API Functions with Perfect Error Handling
// ============================================================================

/**
 * Get all notification settings
 */
export const getAllNotificationSettings = async (): Promise<
  ApiResponse<INotificationSettings[]>
> => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<INotificationSettings[]>
    >("/notification-settings");

    console.log(
      "✅ Notification settings fetched successfully:",
      response.data,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    console.error("❌ Get all notification settings error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    // Handle network errors specifically
    if (error.message === "Network Error") {
      throw new Error("Request blocked. Check backend CORS origin settings.");
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 401:
        throw new Error("You are not authorized. Please login again.");
      case 403:
        throw new Error(
          "You don't have permission to view notification settings.",
        );
      case 404:
        throw new Error("Notification settings not found.");
      case 500:
        throw new Error("Server error. Please try again later.");
    }

    // Throw the error message from response or a generic one
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch notification settings. Please try again.",
    );
  }
};

/**
 * Get notification setting by ID
 */
export const getNotificationSettingById = async (
  id: string,
): Promise<ApiResponse<INotificationSettings>> => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get<
      ApiResponse<INotificationSettings>
    >(`/notification-settings/${id}`);

    console.log(
      `✅ Notification setting ${id} fetched successfully:`,
      response.data,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    console.error(`❌ Get notification setting ${id} error:`, {
      message: error.message,
      status: error.response?.status,
      code: error.code,
    });

    // Handle network errors specifically
    if (error.message === "Network Error") {
      throw new Error("Request blocked. Check backend CORS origin settings.");
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        throw new Error("Invalid notification setting ID format.");
      case 401:
        throw new Error("You are not authorized. Please login again.");
      case 403:
        throw new Error(
          "You don't have permission to view this notification setting.",
        );
      case 404:
        throw new Error("Notification setting not found.");
      case 500:
        throw new Error("Server error. Please try again later.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch notification setting.",
    );
  }
};

/**
 * Update notification setting (only isActive field)
 */
export const updateNotificationSetting = async (
  id: string,
  data: IUpdateNotificationSettings,
): Promise<ApiResponse<INotificationSettings>> => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.patch<
      ApiResponse<INotificationSettings>
    >(`/notification-settings/${id}`, data);

    console.log(
      `✅ Notification setting ${id} updated successfully:`,
      response.data,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    console.error(`❌ Update notification setting ${id} error:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
      data: data,
    });

    // Handle network errors specifically
    if (error.message === "Network Error") {
      throw new Error("Request blocked. Check backend CORS origin settings.");
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    // Handle validation errors (usually 422)
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");
        throw new Error(
          errorMessages || "Validation failed. Please check your input.",
        );
      }
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        throw new Error("Invalid data provided.");
      case 401:
        throw new Error("You are not authorized. Please login again.");
      case 403:
        throw new Error(
          "You don't have permission to update this notification setting.",
        );
      case 404:
        throw new Error("Notification setting not found.");
      case 500:
        throw new Error("Server error. Please try again later.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update notification setting. Please try again.",
    );
  }
};

/**
 * Toggle notification setting active status (helper function)
 */
export const toggleNotificationSetting = async (
  id: string,
  isActive: boolean,
): Promise<ApiResponse<INotificationSettings>> => {
  return updateNotificationSetting(id, { isActive });
};

/**
 * Get notification settings by type (helper function to filter on client)
 */
export const getSettingsByType = async (
  settings: INotificationSettings[],
  type: NotificationType,
): Promise<INotificationSettings[]> => {
  return settings.filter((setting) => setting.name === type);
};

/**
 * Get active notification settings (helper function)
 */
export const getActiveSettings = async (
  settings: INotificationSettings[],
): Promise<INotificationSettings[]> => {
  return settings.filter((setting) => setting.isActive);
};
