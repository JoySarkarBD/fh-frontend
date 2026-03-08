"use client";

import {
  CreateSubscription,
  getMyPaymentHistory,
  type PaymentHistoryItem,
} from "@/services/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define the response type of your API
interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    checkoutSessionUrl: string;
  };
}

export const useSubscriptionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<SubscriptionResponse, Error, void>({
    mutationFn: CreateSubscription,

    onSuccess: () => {
      // Refetch subscriptions list
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
      // Also refetch navbar user state for accurate subscription status
      queryClient.invalidateQueries({ queryKey: ["user", "navbarState"] });
    },

    onError: (error) => {
      console.error("Failed to create subscription:", error.message);
    },
  });

  return {
    createMutation,

    // shortcut methods
    createSubscription: createMutation.mutate,
    createSubscriptionAsync: createMutation.mutateAsync,

    // states
    isLoading: createMutation.isPending,
    isError: createMutation.isError,
    isSuccess: createMutation.isSuccess,

    // data & error
    data: createMutation.data,
    error: createMutation.error,

    // utilities
    reset: createMutation.reset,
  };
};

export const useMyPaymentHistory = () => {
  return useQuery<PaymentHistoryItem[], Error>({
    queryKey: ["subscription-history"],
    queryFn: getMyPaymentHistory,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
