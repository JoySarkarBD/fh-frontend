import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

export enum PropertyStatus {
  SALE = "sale",
  RENT = "rent",
  SOLD = "sold",
}

export interface ICreateProperty {
  propertyName: string;
  propertyStatus: PropertyStatus;
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
  thumbnail?: File;
  images?: File[];
}

// Response type
export interface IPropertyResponse {
  id: string;
  propertyName: string;
  propertyStatus: PropertyStatus;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

export const toFormData = (data: ICreateProperty): FormData => {
  const formData = new FormData();

  formData.append("propertyName", data.propertyName);
  formData.append("propertyStatus", data.propertyStatus);
  formData.append("overview", data.overview);
  formData.append("keyFeatures", data.keyFeatures);
  formData.append("bedrooms", String(data.bedrooms));
  formData.append("bathrooms", String(data.bathrooms));
  formData.append("squareFeet", String(data.squareFeet));
  formData.append("lotSize", String(data.lotSize));
  formData.append("price", String(data.price));
  formData.append("yearBuilt", String(data.yearBuilt));
  formData.append("moreDetails", data.moreDetails);

  if (data.locationMapLink) formData.append("locationMapLink", data.locationMapLink);
  if (data.IsPosted !== undefined) formData.append("IsPosted", String(data.IsPosted));
  if (data.sellPostingDate) formData.append("sellPostingDate", data.sellPostingDate);
  if (data.sellPostingTime) formData.append("sellPostingTime", data.sellPostingTime);

  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => formData.append("images", file));
  }

  return formData;
};

/**
 * Creates a new property with proper error handling
 */
export const createProperty = async (data: ICreateProperty): Promise<ApiResponse<IPropertyResponse>> => {
  try {

    
    const formData = toFormData(data);


    const response = await axiosClient.post<ApiResponse<IPropertyResponse>>(
      "/property", 
      formData, 
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log('Property created successfully:', response.data);
    return response.data;
    
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Log full error details for debugging
    console.error("Create property error details:", {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers,
      }
    });

    // Handle validation errors (usually 422)
    if (axiosError.response?.status === 422) {
      const validationErrors = axiosError.response.data?.errors;
      if (validationErrors) {
        // Format validation errors into a readable message
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        
        throw new Error(
          errorMessages || "Validation failed. Please check your input."
        );
      }
    }

    // Handle other HTTP errors
    if (axiosError.response?.status === 401) {
      throw new Error("You are not authorized. Please login again.");
    }

    if (axiosError.response?.status === 403) {
      throw new Error("You don't have permission to create a property.");
    }

    if (axiosError.response?.status === 413) {
      throw new Error("File size too large. Please upload smaller files.");
    }

    // Handle network errors
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error("Request timeout. Please try again.");
    }

    if (axiosError.code === 'ERR_NETWORK') {
      throw new Error("Network error. Please check your internet connection.");
    }

    // Generic error with server message if available
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to create property. Please try again."
    );
  }
};

/**
 * Optional: Get all properties with error handling
 */
export const getProperties = async (): Promise<ApiResponse<IPropertyResponse[]>> => {
  try {
    const response = await axiosClient.get<ApiResponse<IPropertyResponse[]>>("/property");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error("Get properties error:", {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch properties."
    );
  }
};

/**
 * Optional: Get single property by ID with error handling
 */
export const getPropertyById = async (id: string): Promise<ApiResponse<IPropertyResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<IPropertyResponse>>(`/property/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error(`Get property ${id} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Property not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch property."
    );
  }
};

/**
 * Optional: Update property with error handling
 */
export const updateProperty = async (
  id: string, 
  data: Partial<ICreateProperty>
): Promise<ApiResponse<IPropertyResponse>> => {
  try {
    const formData = new FormData();
    
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

    const response = await axiosClient.patch<ApiResponse<IPropertyResponse>>(
      `/property/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error(`Update property ${id} error:`, {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update property."
    );
  }
};

/**
 * Optional: Delete property with error handling
 */
export const deleteProperty = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosClient.delete<ApiResponse<null>>(`/property/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error(`Delete property ${id} error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
    });

    if (axiosError.response?.status === 404) {
      throw new Error("Property not found.");
    }

    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete property."
    );
  }
};