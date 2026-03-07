"use client";

import {
  useCreatePropertyMutation,
  useUserOwnProperties,
} from "@/actions/hooks/property.hooks";
import PropertyDetailsForm from "@/components/dashboard/property/PropertyDetailsForm";
import PropertyForm from "@/components/dashboard/property/PropertyForm";
import Location from "@/components/home/property/Location";
import { PropertyStatus } from "@/services/property";
import { useState } from "react";

type AddPropertyFormData = {
  propertyName: string;
  address: string;
  propertyType: string;
  propertyStatus: PropertyStatus | "";
  overview: string;
  keyFeatures: string;
  thumbnail?: File;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  price: string;
  lotArea: string;
  yearBuilt: string;
  moreDetails: string;
  photos: File[];
  locationMapLink: string;
};

export default function AddProperty() {
  const [formData, setFormData] = useState<AddPropertyFormData>({
    propertyName: "",
    address: "",
    propertyType: "",
    propertyStatus: "" as PropertyStatus,
    overview: "",
    keyFeatures: "",
    thumbnail: undefined,
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    price: "",
    lotArea: "",
    yearBuilt: "",
    moreDetails: "",
    photos: [] as File[],
    locationMapLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // User properties query
  const { refetch: refetchUserProperties } = useUserOwnProperties({
    page: 1,
    limit: 9,
  });

  // Create property mutation
  const createProperty = useCreatePropertyMutation({
    onSuccess: () => {
      // Refetch user properties AFTER creation
      refetchUserProperties();
      alert("Property created successfully!");
      // Reset form if needed
      setFormData({
        propertyName: "",
        address: "",
        propertyType: "",
        propertyStatus: "" as PropertyStatus,
        overview: "",
        keyFeatures: "",
        thumbnail: undefined,
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        price: "",
        lotArea: "",
        yearBuilt: "",
        moreDetails: "",
        photos: [],
        locationMapLink: "",
      });
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value as AddPropertyFormData[keyof AddPropertyFormData],
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyName)
      newErrors.propertyName = "Property name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.propertyType)
      newErrors.propertyType = "Property type is required";
    if (!formData.propertyStatus)
      newErrors.propertyStatus = "Property status is required";
    if (!formData.overview) newErrors.overview = "Overview is required";
    if (!formData.keyFeatures)
      newErrors.keyFeatures = "Key features is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";
    if (!formData.bedrooms) newErrors.bedrooms = "Bedrooms is required";
    if (!formData.bathrooms) newErrors.bathrooms = "Bathrooms is required";
    if (!formData.squareFeet) newErrors.squareFeet = "Square feet is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.lotArea) newErrors.lotArea = "Lot area is required";
    if (!formData.yearBuilt) newErrors.yearBuilt = "Year built is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(firstError);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const propertyData = {
      propertyName: formData.propertyName,
      address: formData.address,
      propertyType: formData.propertyType,
      propertyStatus: formData.propertyStatus as PropertyStatus,
      overview: formData.overview,
      keyFeatures: formData.keyFeatures,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      squareFeet: parseInt(formData.squareFeet),
      lotSize: parseInt(formData.lotArea),
      price: parseInt(formData.price),
      yearBuilt: parseInt(formData.yearBuilt),
      moreDetails: formData.moreDetails,
      locationMapLink:
        formData.locationMapLink ||
        `https://maps.google.com/?q=${formData.address}`,
      thumbnail: formData.thumbnail ?? undefined,
      images: formData.photos,
    };

    // Trigger mutation (refetch is handled inside onSuccess)
    createProperty.mutate(propertyData);
  };

  return (
    <div className='container mx-auto px-4'>
      <div className='space-y-6'>
        <PropertyForm
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
        <PropertyDetailsForm
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />

        <div className='mt-5'>
          <Location
            address={formData.address}
            lat={undefined}
            lng={undefined}
          />
        </div>

        {errors.submit && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-red-600'>{errors.submit}</p>
          </div>
        )}

        <div className='flex justify-end gap-4'>
          <button
            onClick={handleSubmit}
            disabled={createProperty.isPending}
            className='px-6 py-3 bg-[#619B7F] text-white rounded-md hover:bg-[#4a7b63] transition disabled:opacity-50 disabled:cursor-not-allowed'>
            {createProperty.isPending
              ? "Creating Property..."
              : "Create Property"}
          </button>
        </div>
      </div>
    </div>
  );
}
