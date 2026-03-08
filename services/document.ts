import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

// Document item interface
export interface IDocumentItem {
  _id?: string;
  key: string;
  documentUrl: string;
}

// Document response interface
export interface IDocumentResponse {
  _id?: string;
  id: string;
  propertyId: string;
  propertyName?: string;
  docs: IDocumentItem[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Create document DTO
export interface ICreateDocument {
  propertyId: string;
  docs?: File[];
}

// Pagination meta
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

// API response for paginated documents
export interface PaginatedDocumentsResponse {
  data: IDocumentResponse[];
  meta: Meta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

// Convert to FormData for file upload
export const toFormData = (data: ICreateDocument): FormData => {
  const formData = new FormData();

  formData.append("propertyId", data.propertyId);

  if (data.docs && data.docs.length > 0) {
    data.docs.forEach((file) => formData.append("docs", file));
  }

  return formData;
};

/**
 * Creates a new document with proper error handling
 */
export const createDocument = async (
  data: ICreateDocument,
): Promise<ApiResponse<IDocumentResponse>> => {
  try {
    const formData = toFormData(data);

    const response = await axiosClient.post<ApiResponse<IDocumentResponse>>(
      "/document",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    console.log("Document created successfully:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Create document error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers,
      },
    });

    // Handle validation errors (usually 422)
    if (axiosError.response?.status === 422) {
      const validationErrors = axiosError.response.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");

        throw new Error(
          errorMessages || "Validation failed. Please check your input.",
        );
      }
    }

    // Handle other HTTP errors
    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }

    if (axiosError.response?.status === 403) {
      throw new Error("You don't have permission to upload documents.");
    }

    if (axiosError.response?.status === 413) {
      throw new Error("File size too large. Please upload smaller files.");
    }

    // Handle network errors
    if (axiosError.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    if (axiosError.code === "ERR_NETWORK") {
      throw new Error("Network error. Please check your internet connection.");
    }

    // Generic error with server message if available
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to upload document. Please try again.",
    );
  }
};

/**
 * Get all documents for the current user with pagination
 */
export const getDocuments = async (params?: {
  page?: number;
  limit?: number;
  propertyId?: string;
}): Promise<ApiResponse<PaginatedDocumentsResponse>> => {
  try {
    const response = await axiosClient.get<
      ApiResponse<PaginatedDocumentsResponse>
    >("/document", { params });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error("Get documents error:", {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch documents.",
    );
  }
};

/**
 * Get single document by ID
 */
export const getDocumentById = async (
  id: string,
): Promise<ApiResponse<IDocumentResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<IDocumentResponse>>(
      `/document/${id}`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error(`Get document ${id} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Document not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch document.",
    );
  }
};

/**
 * Delete a specific document item from a document
 */
export const deleteDocumentItem = async (
  documentId: string,
  docId: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosClient.delete<ApiResponse<null>>(
      `/document/${documentId}/docs/${docId}`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    console.error(`Delete document item ${docId} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Document or file not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete document file.",
    );
  }
};
