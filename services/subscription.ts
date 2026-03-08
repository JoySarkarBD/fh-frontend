import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaymentHistoryItem = {
  _id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId: string;
  lifetimeAccessGranted: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
};

export const CreateSubscription = async () => {
  try {
    const response = await axiosClient.post("/payment");

    console.log("Subscription created:", response.data);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Subscription error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      config: axiosError.config,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to create subscription",
    );
  }
};

export const getMyPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<PaymentHistoryItem[]>>(
      "/payment/my-history",
    );

    return response.data?.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load payment history",
    );
  }
};
