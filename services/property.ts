import axiosClient from "@/lib/axiosClient";

export enum PropertyStatus {
  SALE = "sale",
  RENT = "rent",
  SOLD = "sold",
}

export interface ICreateProperty {
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
  thumbnail?: File; // only file for upload
  images?: File[];  // only files for upload
}
export const toFormData = (data: ICreateProperty): FormData => {
  const formData = new FormData();

  formData.append("propertyName", data.propertyName);
  formData.append("status", data.status);
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


export const createProperty = async (data: ICreateProperty) => {
  const formData = toFormData(data);

  const resp = await axiosClient.post("/property", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return resp.data;
};