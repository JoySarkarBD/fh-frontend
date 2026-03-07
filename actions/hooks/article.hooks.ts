"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  createArticle,
  deleteArticleById,
  getAllArticles,
  getArticleById,
  IArticleResponse,
  PaginatedArticlesResponse,
  CreateArticleInput,
  UpdateArticleInput,
  updateArticleById,
} from "@/services/article";

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (filters?: string) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
};

export const useArticles = (
  options?: Omit<
    UseQueryOptions<PaginatedArticlesResponse>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<PaginatedArticlesResponse>({
    queryKey: articleKeys.lists(),
    queryFn: async () => {
      const res = await getAllArticles();
      return res;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });

export const useGetArticleById = (id?: string) =>
  useQuery<IArticleResponse, Error>({
    queryKey: articleKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) {
        throw new Error("No article id provided");
      }
      return getArticleById(id);
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: 1,
  });

export const useCreateArticleMutation = (
  options?: UseMutationOptions<IArticleResponse, Error, CreateArticleInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArticle,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
    ...options,
  });
};

export const useUpdateArticleMutation = (
  options?: UseMutationOptions<
    IArticleResponse,
    Error,
    { id: string; data: UpdateArticleInput }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return updateArticleById(id, data);
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
    ...options,
  });
};

export const useDeleteArticleMutation = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArticleById,
    onSuccess: (data, id, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.removeQueries({ queryKey: articleKeys.detail(id) });
      if (options?.onSuccess) {
        options.onSuccess(data, id, context, mutation);
      }
    },
    ...options,
  });
};
