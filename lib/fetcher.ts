"use server";

import { cookies } from "next/headers";

/**
 * Determines the base URL for API requests based on environment variables and deployment context.
 *
 * @returns The base URL for API requests.
 * @throws If no API base URL is configured in production.
 */
function getApiBaseUrl(): string {
  const configured =
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000/api";
  }

  throw new Error(
    "API base URL is missing. Set `API_BASE_URL` (preferred) or `NEXT_PUBLIC_API_BASE_URL` in Vercel.",
  );
}

type ApiFetchOptions = RequestInit & {
  headers?: HeadersInit;
};

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as ApiErrorPayload;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstMessage = data.errors[0]?.message;

    if (typeof firstMessage === "string" && firstMessage) {
      return firstMessage;
    }
  }

  if (typeof data.message === "string" && data.message) {
    return data.message;
  }

  return null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new Error(
      "Unable to reach backend API. Verify backend deployment and API base URL environment variables.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    const text = await response.text();

    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) || "Request failed. Please try again.",
    );
  }

  return payload as T;
}
