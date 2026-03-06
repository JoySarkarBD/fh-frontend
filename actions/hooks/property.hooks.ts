// actions/hooks/property.hooks.ts
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  createProperty,
  ICreateProperty,
  IPropertyResponse,
  PropertyStatus,
} from "@/services/property";
import axiosClient from "@/lib/axiosClient";

// Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IProperty {
  id: string;
  propertyName: string;
  status: PropertyStatus;
  overview: string;
  keyFeatures: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  price: number;
  yearBuilt: number;
  moreDetails: string;
  locationMapLink?: string;
  IsPosted?: boolean;
  sellPostingDate?: string;
  sellPostingTime?: string;
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Query Keys
export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters?: string) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  userProperties: (userId: string) => [...propertyKeys.all, "user", userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook for getting all properties
 */
export const useProperties = (
  options?: Omit<UseQueryOptions<ApiResponse<IProperty[]>>, "queryKey" | "queryFn">
) => {
  return useQuery<ApiResponse<IProperty[]>>({
    queryKey: propertyKeys.lists(),
    queryFn: async () => {
      const response = await axiosClient.get("/property");
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook for getting properties with filters
 */
// export const useFilteredProperties = (
//   filters?: Record<string, any>,
//   options?: Omit<UseQueryOptions<ApiResponse<IProperty[]>>, "queryKey" | "queryFn">
// ) => {
//   const queryKey = filters 
//     ? propertyKeys.list(JSON.stringify(filters))
//     : propertyKeys.lists();

//   return useQuery<ApiResponse<IProperty[]>>({
//     queryKey,
//     queryFn: async () => {
//       const response = await axiosClient.get("/property", { params: filters });
//       return response.data;
//     },
//     ...options,
//   });
// };

/**
 * Hook for getting a single property by ID
 */
// export const useProperty = (
//   id: string,
//   options?: Omit<UseQueryOptions<ApiResponse<IProperty>>, "queryKey" | "queryFn">
// ) => {
//   return useQuery<ApiResponse<IProperty>>({
//     queryKey: propertyKeys.detail(id),
//     queryFn: async () => {
//       const response = await axiosClient.get(`/property/${id}`);
//       return response.data;
//     },
//     enabled: !!id, // Only run if id exists
//     ...options,
//   });
// };

/**
 * Hook for getting user's properties
 */
export const useUserProperties = (
  userId: string,
  options?: Omit<UseQueryOptions<ApiResponse<IProperty[]>>, "queryKey" | "queryFn">
) => {
  return useQuery<ApiResponse<IProperty[]>>({
    queryKey: propertyKeys.userProperties(userId),
    queryFn: async () => {
      const response = await axiosClient.get(`/property/`);
      return response.data;
    },
    enabled: !!userId,
    ...options,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create property mutation hook
 */
export const useCreatePropertyMutation = (
  options?: UseMutationOptions<ApiResponse<IPropertyResponse>, Error, ICreateProperty>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate properties list to refetch
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      
      // Also invalidate user properties if we have user info
      // You might need to get userId from context or store
      
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error("Create property failed:", error);
      if (options?.onError) {
        options.onError(error, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Update property mutation hook
 */
export const useUpdatePropertyMutation = (
  options?: UseMutationOptions<
    ApiResponse<IProperty>, 
    Error, 
    { id: string; data: Partial<ICreateProperty> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'thumbnail' && value instanceof File) {
            formData.append('thumbnail', value);
          } else if (key === 'images' && Array.isArray(value)) {
            value.forEach(file => {
              if (file instanceof File) {
                formData.append('images', file);
              }
            });
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await axiosClient.patch(`/property/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate specific property and list
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error("Update property failed:", error);
      if (options?.onError) {
        options.onError(error, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

/**
 * Delete property mutation hook
 */
export const useDeletePropertyMutation = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/property/${id}`);
      return response.data;
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate lists after deletion
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.removeQueries({ queryKey: propertyKeys.detail(variables) });
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error("Delete property failed:", error);
      if (options?.onError) {
        options.onError(error, variables, onMutateResult, context);
      }
    },
    ...options,
  });
};

// ============================================================================
// COMBINED HOOK (Optional - if you want all in one)
// ============================================================================

export const useProperty = () => {
  const queryClient = useQueryClient();

  // Queries
  const propertiesQuery = useProperties();
  const createPropertyMutation = useCreatePropertyMutation();
  const updatePropertyMutation = useUpdatePropertyMutation();
  const deletePropertyMutation = useDeletePropertyMutation();

  // Utilities
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.all });
  };

  const clearCache = () => {
    queryClient.removeQueries({ queryKey: propertyKeys.all });
  };

  // Helper to get property from cache
  const getCachedProperty = (id: string) => {
    return queryClient.getQueryData<ApiResponse<IProperty>>(propertyKeys.detail(id));
  };

  // Helper to set property in cache
  const setCachedProperty = (id: string, data: ApiResponse<IProperty>) => {
    queryClient.setQueryData(propertyKeys.detail(id), data);
  };

  return {
    // Queries
    properties: propertiesQuery.data,
    isLoading: propertiesQuery.isLoading,
    isError: propertiesQuery.isError,
    error: propertiesQuery.error,

    // Mutations
    createProperty: createPropertyMutation,
    updateProperty: updatePropertyMutation,
    deleteProperty: deletePropertyMutation,

    // Utilities
    refetchAll,
    clearCache,
    getCachedProperty,
    setCachedProperty,

    // Individual query states
    queries: {
      properties: propertiesQuery,
    },

    // Mutation states
    mutations: {
      createProperty: createPropertyMutation,
      updateProperty: updatePropertyMutation,
      deleteProperty: deletePropertyMutation,
    },
  };
};
