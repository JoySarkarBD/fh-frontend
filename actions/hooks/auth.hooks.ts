// actions/hooks/auth.hooks.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserFromTokenAction,
  getUserProfileAction,
  addAddressAction,
  updateProfileAction,
  type LoginPayload,
  type RegisterPayload,
  type AddAddressPayload,
  type UpdateProfilePayload,
  type AuthNavbarState,
  LoginData,
} from "@/actions/auth.action";
import type { UserProfile } from "@/types/user";
import type { ApiResponse } from "@/lib/api";

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
 * Hook for getting current user navbar state
 */
export const useCurrentUser = () => {
  return useQuery<AuthNavbarState>({
    queryKey: authKeys.navbarState,
    queryFn: getCurrentUserFromTokenAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

/**
 * Hook for getting full user profile
 */
export const useUserProfile = () => {
  return useQuery<UserProfile | null>({
    queryKey: authKeys.profile,
    queryFn: getUserProfileAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Login mutation hook
 */
export const useLoginMutation = (
  options?: UseMutationOptions<ApiResponse<LoginData | null>, Error, LoginPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAction,
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.navbarState });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context );
    },
    onError: (error, variables, context) => {
      console.error("Login failed:", error);
      options?.onError?.(error, variables, context);
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
    onError: (error, variables, context) => {
      console.error("Registration failed:", error);
      options?.onError?.(error, variables, context);
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
    onSuccess: (data, variables, context) => {
      // Clear all user related queries
      queryClient.removeQueries({ queryKey: authKeys.navbarState });
      queryClient.removeQueries({ queryKey: authKeys.profile });
      
      // Also invalidate to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      options?.onSuccess?.(data, variables, context);
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
    onSuccess: (data, variables, context) => {
      // Update profile cache with new data
      queryClient.setQueryData(authKeys.profile, data.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      options?.onSuccess?.(data, variables, context);
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
    onSuccess: (data, variables, context) => {
      // Update profile cache with new data
      queryClient.setQueryData(authKeys.profile, data.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      
      options?.onSuccess?.(data, variables, context);
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