// actions/hooks/auth.hooks.ts
import type { ApiResponse } from "@/lib/api";
import axiosClient from "@/lib/axiosClient";
import {
  getCurrentUserFromTokenAction,
  loginAction,
  LoginData,
  logoutAction,
  registerAction,
  type AddAddressPayload,
  type AuthNavbarState,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "@/services/auth";
import type { UserProfile } from "@/types/user";
import { AxiosError } from "axios";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

type ApiErrorResponse = {
  message?: string;
};

const getUserProfileClient = async (): Promise<UserProfile | null> => {
  try {
    const response =
      await axiosClient.get<ApiResponse<UserProfile>>("/users/me");
    return response.data.data ?? null;
  } catch {
    return null;
  }
};

const addAddressClient = async (
  payload: AddAddressPayload,
): Promise<ApiResponse<UserProfile>> => {
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

  try {
    const response = await axiosClient.patch<ApiResponse<UserProfile>>(
      "/users/me",
      body,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update address",
    );
  }
};

const updateProfileClient = async (
  payload: UpdateProfilePayload,
): Promise<ApiResponse<UserProfile>> => {
  const profileImageFile = payload.profileImage;
  const hasProfileImageFile = profileImageFile instanceof File;

  try {
    if (hasProfileImageFile) {
      const formData = new FormData();
      if (typeof payload.name === "string")
        formData.append("name", payload.name);
      if (typeof payload.phone === "string")
        formData.append("phone", payload.phone);
      if (typeof payload.facebookLink === "string")
        formData.append("facebookLink", payload.facebookLink);
      if (typeof payload.instagramLink === "string")
        formData.append("instagramLink", payload.instagramLink);
      if (typeof payload.twitterLink === "string")
        formData.append("twitterLink", payload.twitterLink);
      if (typeof payload.linkedinLink === "string")
        formData.append("linkedinLink", payload.linkedinLink);
      formData.append("profileImage", profileImageFile);

      const response = await axiosClient.patch<ApiResponse<UserProfile>>(
        "/users/me",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    }

    const response = await axiosClient.patch<ApiResponse<UserProfile>>(
      "/users/me",
      payload,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update profile",
    );
  }
};

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
  options?: Omit<UseQueryOptions<AuthNavbarState>, "queryKey" | "queryFn">,
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
// export const useUserProfile = (
//   options?: Omit<UseQueryOptions<UserProfile | null>, "queryKey" | "queryFn">,
// ) => {
//   return useQuery<UserProfile | null>({
//     queryKey: authKeys.profile,
//     queryFn: getUserProfileAction,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     retry: false,
//     ...options,
//   });
// };
export const useUserProfile = (
  options?: Omit<UseQueryOptions<UserProfile | null>, "queryKey" | "queryFn">,
) => {
  return useQuery<UserProfile | null>({
    queryKey: authKeys.profile,
    queryFn: getUserProfileClient,
    staleTime: 1000 * 30, // reduce to 30 seconds (or 0 for always stale)
    gcTime: 1000 * 60 * 5, // garbage collection after 5 min
    retry: false,
    refetchOnWindowFocus: true, // ← refetch when user returns to tab
    refetchOnMount: true, // ← refetch when component mounts
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
  options?: UseMutationOptions<ApiResponse<LoginData>, Error, LoginPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.navbarState });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      queryClient.removeQueries({ queryKey: ["maintenances"] });

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
  options?: UseMutationOptions<ApiResponse<unknown>, Error, RegisterPayload>,
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
  options?: UseMutationOptions<{ success: boolean }, Error, void>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAction,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Clear all user related queries
      queryClient.removeQueries({ queryKey: authKeys.navbarState });
      queryClient.removeQueries({ queryKey: authKeys.profile });
      queryClient.removeQueries({ queryKey: ["maintenances"] });

      // Also invalidate to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

//   options?: UseMutationOptions<
//     ApiResponse<UserProfile>,
//     Error,
//     AddAddressPayload
//   >,
// ) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: addAddressAction,
//     onSuccess: (data, variables, onMutateResult, context) => {
//       // Just invalidate and let React Query refetch
//       queryClient.invalidateQueries({ queryKey: authKeys.profile });

//       if (options?.onSuccess) {
//         options.onSuccess(data, variables, onMutateResult, context);
//       }
//     },
//     ...options,
//   });
// };
/**
 * Update profile mutation hook
 */

export const useUpdateProfileMutation = (
  options?: UseMutationOptions<
    ApiResponse<UserProfile>,
    Error,
    UpdateProfilePayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileClient,

    onMutate: async (
      variables: UpdateProfilePayload,
    ): Promise<{ previousProfile: UserProfile | null | undefined }> => {
      await queryClient.cancelQueries({ queryKey: authKeys.profile });
      const previousProfile = queryClient.getQueryData<UserProfile | null>(
        authKeys.profile,
      );

      queryClient.setQueryData<UserProfile | null>(authKeys.profile, (old) => {
        if (!old) return old;
        const { profileImage, ...rest } = variables;
        return { ...old, ...rest };
      });

      return { previousProfile };
    },

    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.profile, response.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      queryClient.invalidateQueries({ queryKey: authKeys.navbarState });
    },

    // Accept context as unknown, then safely assert/type guard
    onError: (context: unknown) => {
      // Type guard / assertion – safe and clean
      if (
        context &&
        typeof context === "object" &&
        "previousProfile" in context &&
        context.previousProfile !== undefined
      ) {
        queryClient.setQueryData(authKeys.profile, context.previousProfile);
      }
    },

    ...options,
  });
};

/**
 * Add address mutation hook
 */
export const useAddAddressMutation = (
  options?: UseMutationOptions<
    ApiResponse<UserProfile>,
    Error,
    AddAddressPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddressClient,

    onMutate: async (
      variables: AddAddressPayload,
    ): Promise<{ previousProfile: UserProfile | null | undefined }> => {
      await queryClient.cancelQueries({ queryKey: authKeys.profile });
      const previousProfile = queryClient.getQueryData<UserProfile | null>(
        authKeys.profile,
      );

      queryClient.setQueryData<UserProfile | null>(authKeys.profile, (old) => {
        if (!old) return old;
        if (variables.type === "home") {
          return {
            ...old,
            homeAddress: variables.address?.trim() || "",
            homePhone: variables.phone?.trim() || "",
          };
        }
        if (variables.type === "office") {
          return {
            ...old,
            officeAddress: variables.address?.trim() || "",
            officePhone: variables.phone?.trim() || "",
          };
        }
        return old;
      });

      return { previousProfile };
    },

    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.profile, response.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      queryClient.invalidateQueries({ queryKey: authKeys.navbarState });
    },

    // Fixed: Accept context as unknown + type guard
    onError: (err, variables, onMutateResult, context: unknown) => {
      if (
        context &&
        typeof context === "object" &&
        "previousProfile" in context &&
        context.previousProfile !== undefined
      ) {
        queryClient.setQueryData(authKeys.profile, context.previousProfile);
      }
    },

    ...options,
  });
};
// ============================================================================
// COMBINED HOOK
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
