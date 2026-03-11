"use server";

import { axiosServer } from "@/lib/axiosServer";
import type { UserProfile } from "@/types/user";
import { AxiosError } from "axios";
import { cookies } from "next/headers";

// ============================================================================
// Types
// ============================================================================

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  homeAddress?: string;
  officeAddress?: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginData = {
  accessToken: string;
  user: {
    role?: string;
  };
};

type CurrentUserData = {
  role?: string;
  isSubscribed: boolean;
};

export type AuthNavbarState = {
  isLoggedIn: boolean;
  userRole: "user" | "admin";
  isSubscribed: boolean;
};

export type AddAddressPayload = {
  type: "home" | "office";
  address?: string;
  phone?: string;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  facebookLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  linkedinLink?: string;
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
}

// ============================================================================
// Helper function to get axios instance with token
// ============================================================================

async function getAxiosInstance() {
  return await axiosServer();
}
// ============================================================================
// Actions
// ============================================================================

/**
 * Registers a new user with the provided registration details.
 */
export async function registerAction(payload: RegisterPayload) {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      "/auth/register",
      payload,
    );

    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Registration error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Registration failed. Please try again.",
    );
  }
}

/**
 * Logs in a user with the provided email and password
 */
export async function loginAction(
  payload: LoginPayload,
): Promise<ApiResponse<LoginData>> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post<ApiResponse<LoginData>>(
      "/auth/login",
      payload,
    );

    const token = response.data.data?.accessToken;

    if (token) {
      const cookieStore = await cookies();

      cookieStore.set("accessToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Login error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed. Please try again.",
    );
  }
}

/**
 * Fetch the Current User
 */
export async function getCurrentUserFromTokenAction(): Promise<AuthNavbarState> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response =
      await axiosInstance.get<ApiResponse<CurrentUserData>>("/users/me");

    console.log("Current user fetched:", response.data);

    const normalizedRole =
      String(response.data.data?.role ?? "user").toLowerCase() === "admin"
        ? "admin"
        : "user";

    // handle boolean or string 'true'/'false' from backend
    const isSubscribedRaw = response.data?.data?.isSubscribed;
    let isSubscribed: boolean;
    if (typeof isSubscribedRaw === "string") {
      isSubscribed = isSubscribedRaw === "true";
    } else {
      isSubscribed = Boolean(isSubscribedRaw);
    }
    console.log(response.data?.data, "logged subscribed");

    return {
      isLoggedIn: true,
      userRole: normalizedRole,
      isSubscribed,
    };
  } catch {
    // Missing/expired token or unauthenticated requests are expected here.
    // Return a safe logged-out state without noisy console errors.

    return {
      isLoggedIn: false,
      userRole: "user",
      isSubscribed: false,
    };
  }
}

/**
 * Fetch the full user profile from the backend using the server cookie token.
 */
export async function getUserProfileAction(): Promise<UserProfile | null> {
  try {
    const axiosInstance = await getAxiosInstance();
    const response =
      await axiosInstance.get<ApiResponse<UserProfile>>("/users/me");

    console.log("User profile fetched:", response.data);
    return response.data.data ?? null;
  } catch {
    // Missing/expired token or unauthenticated requests are expected here.
    // Return null without noisy console errors.
    return null;
  }
}

/**
 * Adds or updates the user's home or office address and phone number
 */
export async function addAddressAction(payload: AddAddressPayload) {
  try {
    const axiosInstance = await getAxiosInstance();

    const body =
      payload.type === "home"
        ? {
            homeAddress: payload.address?.trim() || "",
            homePhone: payload.phone?.trim() || "",
          }
        : {
            officeAddress: payload.address?.trim() || "",
            officePhone: payload.phone?.trim() || "",
          };

    const response = await axiosInstance.patch<ApiResponse<UserProfile>>(
      "/users/me",
      body,
    );

    console.log("Address added/updated:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Add address error:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update address",
    );
  }
}

/**
 * Update user's profile fields (name, phone) using PATCH /users/me
 */
export async function updateProfileAction(payload: UpdateProfilePayload) {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>(
      "/users/me",
      payload,
    );

    console.log("Profile updated:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Update profile error:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update profile",
    );
  }
}

/**
 * Changes the user's password by sending the current password, new password, and confirm new password to the backend. Validates that the new password and confirm new password match before making the API call.
 */
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export async function changePasswordAction(payload: ChangePasswordPayload) {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.patch<ApiResponse<unknown>>(
      "/auth/change-password",
      payload,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to change password.",
    );
  }
}

/**
 * Logs out the current user by deleting the access token cookie.
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");

    console.log("Logout successful");
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Logout error:", {
      message: axiosError.message,
    });

    throw new Error(axiosError.message || "Logout failed. Please try again.");
  }
}
