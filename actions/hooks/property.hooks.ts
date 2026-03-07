// actions/hooks/property.hooks.ts
import type { ApiResponse } from "@/lib/api";
import axiosClient from "@/lib/axiosClient";
import {
  createProperty,
  getPropertyById,
  ICreateProperty,
  IPropertyResponse,
  Meta,
  PaginatedPropertiesResponse,
  PropertyStatus,
} from "@/services/property";
import { getAllProperties, getOwnProperties } from "@/services/property.server";
import {
  keepPreviousData,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

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
  isPublished?: boolean;
  sellPostingDate?: string;
  sellPostingTime?: string;
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListQuery {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  squareFeet?: number[];
  bedrooms?: number[];
  bathrooms?: number[];
}

// ============================================================================
// Query Keys
// ============================================================================

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters?: PropertyListQuery) =>
    [...propertyKeys.lists(), filters ?? {}] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  userProperties: (userId: string) =>
    [...propertyKeys.all, "user", userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

export const useProperties = (
  params?: PropertyListQuery,
  options?: Omit<
    UseQueryOptions<ApiResponse<PaginatedPropertiesResponse>>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ApiResponse<PaginatedPropertiesResponse>>({
    queryKey: propertyKeys.list(params),
    queryFn: async () => {
      const searchParams = {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.minPrice !== undefined
          ? { minPrice: params.minPrice }
          : {}),
        ...(params?.maxPrice !== undefined
          ? { maxPrice: params.maxPrice }
          : {}),
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.squareFeet?.length
          ? { squareFeet: params.squareFeet.join(",") }
          : {}),
        ...(params?.bedrooms?.length
          ? { bedrooms: params.bedrooms.join(",") }
          : {}),
        ...(params?.bathrooms?.length
          ? { bathrooms: params.bathrooms.join(",") }
          : {}),
      };
      const res = await axiosClient.get("/property", { params: searchParams });
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });

export const useUserOwnProperties = (
  params?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<ApiResponse<PaginatedPropertiesResponse>>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ApiResponse<PaginatedPropertiesResponse>>({
    queryKey: ["properties", params],
    queryFn: () => getOwnProperties(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });

export type AdminPropertiesResponse = {
  properties: IPropertyResponse[];
  meta: Meta;
};

export const useGetAllPropertiesAdmin = (
  page: number = 1,
  limit: number = 10,
  search: string = "",
) =>
  useQuery<AdminPropertiesResponse, Error>({
    queryKey: ["admin-properties", page, limit, search],
    queryFn: async () => {
      const res = await getAllProperties({ page, limit, search });
      return {
        properties: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          page: 1,
          limit,
          total: 0,
          totalPage: 1,
        },
      };
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

export const useGetPropertyById = (id?: string) =>
  useQuery<IPropertyResponse, Error>({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("No property id provided");
      }
      const res = await getPropertyById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: 1,
  });

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreatePropertyMutation = (
  options?: UseMutationOptions<
    ApiResponse<IPropertyResponse>,
    Error,
    ICreateProperty
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: propertyKeys.userProperties("me"),
      });

      if (options?.onSuccess)
        options.onSuccess(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("Create property failed:", error);
      if (options?.onError)
        options.onError(error, variables, context, mutation);
    },
    ...options,
  });
};

export const useUpdatePropertyMutation = (
  options?: UseMutationOptions<
    ApiResponse<IPropertyResponse>,
    Error,
    { id: string; data: Partial<ICreateProperty> }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "thumbnail" && value instanceof File)
            formData.append("thumbnail", value);
          else if (key === "images" && Array.isArray(value)) {
            value.forEach((file) => {
              if (file instanceof File) formData.append("images", file);
            });
          } else formData.append(key, String(value));
        }
      });
      const res = await axiosClient.patch(`/property/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });

      if (options?.onSuccess)
        options.onSuccess(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("Update property failed:", error);
      if (options?.onError)
        options.onError(error, variables, context, mutation);
    },
    ...options,
  });
};

export const useDeletePropertyMutation = (
  options?: UseMutationOptions<ApiResponse<null>, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(`/property/${id}`);
      return res.data;
    },
    onSuccess: (data, id, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });

      if (options?.onSuccess) options.onSuccess(data, id, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      console.error("Delete property failed:", error);
      if (options?.onError)
        options.onError(error, variables, context, mutation);
    },
    ...options,
  });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useProperty = () => {
  const queryClient = useQueryClient();

  const propertiesQuery = useProperties();
  const userPropertiesQuery = useUserOwnProperties();

  const createMutation = useCreatePropertyMutation();
  const updateMutation = useUpdatePropertyMutation();
  const deleteMutation = useDeletePropertyMutation();

  return {
    // Queries
    properties: propertiesQuery.data,
    userProperties: userPropertiesQuery.data,
    isLoading: propertiesQuery.isLoading || userPropertiesQuery.isLoading,
    isError: propertiesQuery.isError || userPropertiesQuery.isError,
    error: propertiesQuery.error || userPropertiesQuery.error,

    // Mutations
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,

    // Utilities
    refetchAll: () =>
      queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
    clearCache: () => queryClient.removeQueries({ queryKey: propertyKeys.all }),

    // Individual query states
    queries: {
      properties: propertiesQuery,
      userProperties: userPropertiesQuery,
    },
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
    },
  };
};

export const usePropertyById = (
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<IPropertyResponse>>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ApiResponse<IPropertyResponse>>({
    queryKey: propertyKeys.detail(id),
    queryFn: () => getPropertyById(id),
    enabled: !!id, // prevent running if id missing
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
