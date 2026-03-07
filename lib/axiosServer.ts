// lib/axiosServer.ts
import { config } from "@/config/config";
import axios from "axios";
import { cookies } from "next/headers";

export const axiosServer = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;



  const instance = axios.create({
    baseURL: config.BASE_URL,
    withCredentials: true,
    timeout: 10000, // 10 seconds timeout
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Suppress terminal error logs
      return Promise.reject(error);
    },
  );

  return instance;
};
