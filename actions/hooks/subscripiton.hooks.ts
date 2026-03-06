"use client";

import { CreateSubscription } from "@/services/subscription";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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