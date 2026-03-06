"use client";

import { getUserClient } from "@/services/user";
import { useQuery } from "@tanstack/react-query";


export const useGetUser = () => {
  return useQuery({
    queryKey: ["subscriptions", "users"],
    queryFn: getUserClient,
    staleTime: 60 * 1000, // 1 min
  });
};