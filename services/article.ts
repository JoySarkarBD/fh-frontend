import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";
import type { Iblog } from "@/types/blog";

export type ArticleCategory =
  | "SELLING_TIPS"
  | "BUYING_GUIDE"
  | "MARKET_ANALYSI";

export interface ArticleImage {
  key?: string;
  image?: string;
}

export interface IArticleResponse {
  _id?: string;
  id?: string;
  title: string;
  publishDate?: string;
  blogDetails: string;
  category: ArticleCategory;
  image: string | ArticleImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticlePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedArticlesResponse {
  data: IArticleResponse[];
  pagination: ArticlePagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: unknown;
}

export interface CreateArticleInput {
  title: string;
  category: ArticleCategory;
  blogDetails: string;
  publishDate?: string;
  image: File;
}

export interface UpdateArticleInput {
  title?: string;
  category?: ArticleCategory;
  blogDetails?: string;
  publishDate?: string;
  image?: File;
}

const formatErrorMessage = (value: unknown): string => {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map((item) => formatErrorMessage(item)).join(", ");
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const parseValidationErrors = (errors: unknown): string => {
  if (Array.isArray(errors)) {
    return errors
      .map((item, index) => `${index}: ${formatErrorMessage(item)}`)
      .join("; ");
  }

  if (typeof errors === "object" && errors !== null) {
    return Object.entries(errors as Record<string, unknown>)
      .map(([field, messages]) => `${field}: ${formatErrorMessage(messages)}`)
      .join("; ");
  }

  return formatErrorMessage(errors);
};

const toFormData = (
  data: CreateArticleInput | UpdateArticleInput,
): FormData => {
  const formData = new FormData();

  if (typeof data.title === "string") {
    formData.append("title", data.title);
  }
  if (typeof data.category === "string") {
    formData.append("category", data.category);
  }
  if (typeof data.blogDetails === "string") {
    formData.append("blogDetails", data.blogDetails);
  }
  if (
    typeof data.publishDate === "string" &&
    data.publishDate.trim().length > 0
  ) {
    formData.append("publishDate", data.publishDate);
  }
  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  return formData;
};

const getImageUrl = (image: IArticleResponse["image"]): string => {
  const isUsableUrl = (value: string) =>
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/");

  if (typeof image === "string") {
    return isUsableUrl(image) ? image : "";
  }

  if (typeof image?.image === "string" && isUsableUrl(image.image)) {
    return image.image;
  }

  if (typeof image?.key === "string" && isUsableUrl(image.key)) {
    return image.key;
  }

  return "";
};

const formatDate = (raw?: string): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const articleToBlog = (article: IArticleResponse): Iblog => ({
  id: article._id || article.id || "",
  title: article.title,
  description: article.blogDetails,
  date: formatDate(article.publishDate || article.createdAt),
  category: article.category,
  image: getImageUrl(article.image),
  blogDetails: article.blogDetails,
  publishDate: article.publishDate,
});

export async function getAllArticles(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedArticlesResponse> {
  try {
    const response = await axiosClient.get<
      ApiResponse<PaginatedArticlesResponse>
    >("/article", {
      params,
    });

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    throw new Error(
      errorData?.message || axiosError.message || "Failed to load articles.",
    );
  }
}

export async function getArticleById(id: string): Promise<IArticleResponse> {
  try {
    const response = await axiosClient.get<ApiResponse<IArticleResponse>>(
      `/article/${id}`,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    throw new Error(
      errorData?.message || axiosError.message || "Failed to load article.",
    );
  }
}

export async function createArticle(
  payload: CreateArticleInput,
): Promise<IArticleResponse> {
  try {
    const response = await axiosClient.post<ApiResponse<IArticleResponse>>(
      "/article",
      toFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    if (errorData?.errors) {
      throw new Error(
        `Validation failed: ${parseValidationErrors(errorData.errors)}`,
      );
    }

    throw new Error(
      errorData?.message || axiosError.message || "Failed to create article.",
    );
  }
}

export async function updateArticleById(
  id: string,
  payload: UpdateArticleInput,
): Promise<IArticleResponse> {
  try {
    const response = await axiosClient.patch<ApiResponse<IArticleResponse>>(
      `/article/${id}`,
      toFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    if (errorData?.errors) {
      throw new Error(
        `Validation failed: ${parseValidationErrors(errorData.errors)}`,
      );
    }

    throw new Error(
      errorData?.message || axiosError.message || "Failed to update article.",
    );
  }
}

export async function deleteArticleById(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/article/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    throw new Error(
      errorData?.message || axiosError.message || "Failed to delete article.",
    );
  }
}
