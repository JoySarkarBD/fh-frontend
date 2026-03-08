import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  type ICreateMaintenance,
  type IUpdateMaintenance,
} from "@/services/maintenance";

// Query keys
export const maintenanceKeys = {
  all: ["maintenances"] as const,
  lists: () => [...maintenanceKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; search?: string }) =>
    [...maintenanceKeys.lists(), filters] as const,
  details: () => [...maintenanceKeys.all, "detail"] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
};

/**
 * Hook to fetch all maintenance requests with pagination
 */
export const useMaintenances = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const sessionKey = Cookies.get("accessToken") || "guest";

  return useQuery({
    queryKey: [...maintenanceKeys.list(params || {}), sessionKey],
    queryFn: async () => {
      const response = await getMaintenances(params);
      return response.data;
    },
    refetchOnMount: "always",
  });
};

/**
 * Hook to fetch a single maintenance request by ID
 */
export const useMaintenance = (id?: string) => {
  return useQuery({
    queryKey: maintenanceKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Maintenance ID is required");
      const response = await getMaintenanceById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new maintenance request
 */
export const useCreateMaintenanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateMaintenance) => {
      const response = await createMaintenance(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch maintenances list
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
};

/**
 * Hook to update a maintenance request
 */
export const useUpdateMaintenanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: IUpdateMaintenance;
    }) => {
      const response = await updateMaintenance(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific maintenance and list
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete a maintenance request
 */
export const useDeleteMaintenanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteMaintenance(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch maintenances list
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
};
