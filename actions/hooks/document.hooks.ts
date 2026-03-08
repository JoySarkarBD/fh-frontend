import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocumentItem,
  type ICreateDocument,
} from "@/services/document";

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; propertyId?: string }) =>
    [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

/**
 * Hook to fetch all documents with pagination
 */
export const useDocuments = (params?: {
  page?: number;
  limit?: number;
  propertyId?: string;
}) => {
  return useQuery({
    queryKey: documentKeys.list(params || {}),
    queryFn: async () => {
      const response = await getDocuments(params);
      return response.data;
    },
  });
};

/**
 * Hook to fetch a single document by ID
 */
export const useDocument = (id?: string) => {
  return useQuery({
    queryKey: documentKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Document ID is required");
      const response = await getDocumentById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new document
 */
export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateDocument) => {
      const response = await createDocument(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
};

/**
 * Hook to delete a document item
 */
export const useDeleteDocumentItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      docId,
    }: {
      documentId: string;
      docId: string;
    }) => {
      const response = await deleteDocumentItem(documentId, docId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific document and list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.documentId),
      });
    },
  });
};
