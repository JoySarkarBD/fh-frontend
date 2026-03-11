"use client";

import {
  getAllNotificationSettings,
  getNotificationSettingById,
  updateNotificationSetting,
  toggleNotificationSetting,
  type INotificationSettings,
  type IUpdateNotificationSettings,
  type ApiResponse,
  NotificationType,
  NotificationSettingsTitle,
} from "@/services/notification-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

export interface NotificationSettingsResponse {
  success: boolean;
  message: string;
  data: INotificationSettings[];
}

export interface SingleNotificationSettingResponse {
  success: boolean;
  message: string;
  data: INotificationSettings;
}

// ============================================================================
// Query Keys
// ============================================================================

export const notificationSettingsKeys = {
  all: ["notification-settings"] as const,
  lists: () => [...notificationSettingsKeys.all, "list"] as const,
  details: () => [...notificationSettingsKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationSettingsKeys.details(), id] as const,
  active: () => [...notificationSettingsKeys.all, "active"] as const,
  byType: (type: NotificationType) => 
    [...notificationSettingsKeys.all, "type", type] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all notification settings
 */
export const useNotificationSettings = () => {
  return useQuery<INotificationSettings[], Error>({
    queryKey: notificationSettingsKeys.lists(),
    queryFn: async () => {
      const response = await getAllNotificationSettings();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Get notification setting by ID
 */
export const useNotificationSettingById = (id: string) => {
  return useQuery<INotificationSettings, Error>({
    queryKey: notificationSettingsKeys.detail(id),
    queryFn: async () => {
      const response = await getNotificationSettingById(id);
      return response.data;
    },
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Get active notification settings (filtered)
 */
export const useActiveNotificationSettings = () => {
  return useQuery<INotificationSettings[], Error>({
    queryKey: notificationSettingsKeys.active(),
    queryFn: async () => {
      const response = await getAllNotificationSettings();
      return response.data.filter(setting => setting.isActive);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Get notification settings by type
 */
export const useNotificationSettingsByType = (type: NotificationType) => {
  return useQuery<INotificationSettings[], Error>({
    queryKey: notificationSettingsKeys.byType(type),
    queryFn: async () => {
      const response = await getAllNotificationSettings();
      return response.data.filter(setting => setting.name === type);
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update notification setting mutation
 */
export const useUpdateNotificationSettingMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    INotificationSettings, 
    Error, 
    { id: string; data: IUpdateNotificationSettings }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateNotificationSetting(id, data);
      return response.data;
    },

    onSuccess: (data, variables) => {
      // Update the specific notification setting in cache
      queryClient.setQueryData<INotificationSettings[]>(
        notificationSettingsKeys.lists(),
        (old) => {
          if (!old) return [data];
          return old.map(item => 
            item.id === variables.id ? { ...item, ...data } : item
          );
        }
      );

      // Update the individual detail query
      queryClient.setQueryData<INotificationSettings>(
        notificationSettingsKeys.detail(variables.id),
        data
      );

      // Invalidate active settings list
      queryClient.invalidateQueries({ 
        queryKey: notificationSettingsKeys.active() 
      });

      // Invalidate by type queries
      queryClient.invalidateQueries({ 
        queryKey: notificationSettingsKeys.byType(data.name) 
      });

      console.log(`✅ Notification setting ${variables.id} updated successfully`);
    },

    onError: (error) => {
      console.error("❌ Failed to update notification setting:", error.message);
    },
  });

  return {
    updateMutation: mutation,

    // shortcut methods
    updateSetting: mutation.mutate,
    updateSettingAsync: mutation.mutateAsync,

    // states
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,

    // data & error
    data: mutation.data,
    error: mutation.error,

    // utilities
    reset: mutation.reset,
  };
};

/**
 * Toggle notification setting active status mutation
 */
export const useToggleNotificationSettingMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    INotificationSettings,
    Error,
    { id: string; isActive: boolean }
  >({
    mutationFn: async ({ id, isActive }) => {
      const response = await toggleNotificationSetting(id, isActive);
      return response.data;
    },

    onSuccess: (data, variables) => {
      // Update the specific notification setting in cache
      queryClient.setQueryData<INotificationSettings[]>(
        notificationSettingsKeys.lists(),
        (old) => {
          if (!old) return [data];
          return old.map(item => 
            item.id === variables.id ? { ...item, isActive: variables.isActive } : item
          );
        }
      );

      // Update the individual detail query
      queryClient.setQueryData<INotificationSettings>(
        notificationSettingsKeys.detail(variables.id),
        (old) => old ? { ...old, isActive: variables.isActive } : data
      );

      // Invalidate active settings list (always needed when toggling)
      queryClient.invalidateQueries({ 
        queryKey: notificationSettingsKeys.active() 
      });

      // Also invalidate by type queries
      if (data.name) {
        queryClient.invalidateQueries({ 
          queryKey: notificationSettingsKeys.byType(data.name) 
        });
      }

      console.log(`✅ Notification setting ${variables.id} toggled to ${variables.isActive ? 'ON' : 'OFF'}`);
    },

    onError: (error) => {
      console.error("❌ Failed to toggle notification setting:", error.message);
    },
  });

  return {
    toggleMutation: mutation,

    // shortcut methods
    toggleSetting: mutation.mutate,
    toggleSettingAsync: mutation.mutateAsync,

    // states
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,

    // data & error
    data: mutation.data,
    error: mutation.error,

    // utilities
    reset: mutation.reset,
  };
};

/**
 * Bulk update notification settings mutation
 */
export const useBulkUpdateNotificationSettingsMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    INotificationSettings[],
    Error,
    Array<{ id: string; isActive: boolean }>
  >({
    mutationFn: async (updates) => {
      const promises = updates.map(update => 
        toggleNotificationSetting(update.id, update.isActive)
      );
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },

    onSuccess: (data, variables) => {
      // Update all notification settings in cache
      queryClient.setQueryData<INotificationSettings[]>(
        notificationSettingsKeys.lists(),
        (old) => {
          if (!old) return data;
          
          // Create a map of updates for quick lookup
          const updateMap = new Map(variables.map(v => [v.id, v.isActive]));
          
          return old.map(item => {
            const newIsActive = updateMap.get(item.id);
            return newIsActive !== undefined 
              ? { ...item, isActive: newIsActive } 
              : item;
          });
        }
      );

      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: notificationSettingsKeys.all,
        refetchType: "all"
      });

      console.log(`✅ Bulk updated ${variables.length} notification settings`);
    },

    onError: (error) => {
      console.error("❌ Failed to bulk update notification settings:", error.message);
    },
  });

  return {
    bulkUpdateMutation: mutation,

    // shortcut methods
    bulkUpdate: mutation.mutate,
    bulkUpdateAsync: mutation.mutateAsync,

    // states
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,

    // data & error
    data: mutation.data,
    error: mutation.error,

    // utilities
    reset: mutation.reset,
  };
};

// ============================================================================
// COMBINED HOOK (optional, if you want everything in one place)
// ============================================================================

export const useNotificationSettingsMutations = () => {
  const update = useUpdateNotificationSettingMutation();
  const toggle = useToggleNotificationSettingMutation();
  const bulkUpdate = useBulkUpdateNotificationSettingsMutation();

  return {
    // Individual mutations
    update,
    toggle,
    bulkUpdate,

    // Combined states
    isLoading: update.isLoading || toggle.isLoading || bulkUpdate.isLoading,
    isError: update.isError || toggle.isError || bulkUpdate.isError,
    
    // Reset all
    resetAll: () => {
      update.reset();
      toggle.reset();
      bulkUpdate.reset();
    },
  };
};