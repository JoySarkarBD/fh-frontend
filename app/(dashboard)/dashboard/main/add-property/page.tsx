// app/dashboard/property/add/page.tsx
"use client";

import { useCreatePropertyMutation } from "@/actions/hooks/property.hooks";
import PropertyDetailsForm from "@/components/dashboard/property/PropertyDetailsForm";
import PropertyForm from "@/components/dashboard/property/PropertyForm";
import Location from "@/components/home/property/Location";
import { PropertyStatus } from "@/services/property";
import { useState } from "react";

export default function AddProperty() {
  const [formData, setFormData] = useState({
    // Basic Info
    propertyName: "",
    address: "",
    propertyType: "",
    propertyStatus: "" as PropertyStatus,
    overview: "",
    keyFeatures: "",
    thumbnail: null as File | null,

    // Details
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    price: "",
    lotArea: "",
    yearBuilt: "",
    moreDetails: "",
    photos: [] as File[],

    // Location
    locationMapLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  const createProperty = useCreatePropertyMutation({
    onSuccess: (data) => {
      // Show success message
      alert("Property created successfully!");
      // Reset form or redirect
      // router.push("/dashboard/properties");
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.propertyStatus) newErrors.propertyStatus = "Property status is required";
    if (!formData.overview) newErrors.overview = "Overview is required";
    if (!formData.keyFeatures) newErrors.keyFeatures = "Key features is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";

    // Details validation
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
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(firstError);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const propertyData = {
      propertyName: formData.propertyName,
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
      locationMapLink: formData.locationMapLink || `https://maps.google.com/?q=${formData.address}`,
      thumbnail: formData.thumbnail ?? undefined,
      images: formData.photos,
    };

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
            lat={locationCoords?.lat}
            lng={locationCoords?.lng}
          />
        </div>

        {/* Error Summary */}
        {errors.submit && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-red-600'>{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          <button
            onClick={handleSubmit}
            disabled={createProperty.isPending}
            className='px-6 py-3 bg-[#619B7F] text-white rounded-md hover:bg-[#4a7b63] transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {createProperty.isPending ? "Creating Property..." : "Create Property"}
          </button>
        </div>
      </div>
    </div>
  );
}
