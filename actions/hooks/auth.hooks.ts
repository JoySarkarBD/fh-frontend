// actions/hooks/auth.hooks.ts
import type { ApiResponse } from "@/lib/api";
import {
  addAddressAction,
  getCurrentUserFromTokenAction,
  getUserProfileAction,
  loginAction,
  LoginData,
  logoutAction,
  registerAction,
  updateProfileAction,
  type AddAddressPayload,
  type AuthNavbarState,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "@/services/auth";
import type { UserProfile } from "@/types/user";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: ["user"] as const,
  profile: ["user", "profile"] as const,
  navbarState: ["user", "navbarState"] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook for getting current user navbar state with options support
 */
export const useCurrentUser = (
  options?: Omit<UseQueryOptions<AuthNavbarState>, "queryKey" | "queryFn">
) => {
  return useQuery<AuthNavbarState>({
    queryKey: authKeys.navbarState,
    queryFn: getCurrentUserFromTokenAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    ...options,
  });
};

// actions/hooks/auth.hooks.ts - useUserProfile 

/**
 * Hook for getting full user profile with options support
 */
export const useUserProfile = (
  options?: Omit<UseQueryOptions<UserProfile | null>, "queryKey" | "queryFn">
) => {
  return useQuery<UserProfile | null>({
    queryKey: authKeys.profile,
    queryFn: getUserProfileAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    ...options,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Login mutation hook
 */
export const useLoginMutation = (
  options?: UseMutationOptions<ApiResponse<LoginData>, Error, LoginPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.navbarState });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error("Login failed:", error);
      if (options?.onError) {
        options.onError(error, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Register mutation hook
 */
export const useRegisterMutation = (
  options?: UseMutationOptions<ApiResponse<unknown>, Error, RegisterPayload>
) => {
  return useMutation({
    mutationFn: registerAction,
    onError: (error, variables, onMutateResult, context) => {
      console.error("Registration failed:", error);
      if (options?.onError) {
        options.onError(error, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Logout mutation hook
 */
export const useLogoutMutation = (
  options?: UseMutationOptions<{ success: boolean }, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Clear all user related queries
      queryClient.removeQueries({ queryKey: authKeys.navbarState });
      queryClient.removeQueries({ queryKey: authKeys.profile });
      
      // Also invalidate to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Add address mutation hook
 */
export const useAddAddressMutation = (
  options?: UseMutationOptions<ApiResponse<UserProfile>, Error, AddAddressPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddressAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Update profile cache with new data
      queryClient.setQueryData(authKeys.profile, data.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Update profile mutation hook
 */
export const useUpdateProfileMutation = (
  options?: UseMutationOptions<ApiResponse<UserProfile>, Error, UpdateProfilePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Update profile cache with new data
      queryClient.setQueryData(authKeys.profile, data.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

// ============================================================================
// COMBINED HOOK (Optional - if you want all in one)
// ============================================================================

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const currentUserQuery = useCurrentUser();
  const userProfileQuery = useUserProfile();
  
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const addAddressMutation = useAddAddressMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  };

  const clearCache = () => {
    queryClient.removeQueries({ queryKey: authKeys.all });
  };

  return {
    // Queries
    currentUser: currentUserQuery.data,
    userProfile: userProfileQuery.data,
    isLoading: currentUserQuery.isLoading || userProfileQuery.isLoading,
    isError: currentUserQuery.isError || userProfileQuery.isError,
    error: currentUserQuery.error || userProfileQuery.error,

    // Mutations
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    addAddress: addAddressMutation,
    updateProfile: updateProfileMutation,

    // Utilities
    refetchAll,
    clearCache,
    
    // Individual query states (if needed)
    queries: {
      currentUser: currentUserQuery,
      userProfile: userProfileQuery,
    },
  };
};
