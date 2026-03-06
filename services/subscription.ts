
import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

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
        "Failed to create subscription"
    );
  }
};