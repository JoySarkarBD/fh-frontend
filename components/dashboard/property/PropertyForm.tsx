// components/dashboard/property/PropertyForm.tsx
"use client";
import Image from "next/image";
import { useState } from "react";

interface PropertyFormData {
  propertyName: string;
  address: string;
  propertyType: string;
  propertyStatus: string;
  overview: string;
  keyFeatures: string;
  thumbnail?: File;
}

interface PropertyFormProps {
  formData: PropertyFormData;
  updateFormData: (key: keyof PropertyFormData, value: PropertyFormData[keyof PropertyFormData]) => void;
  errors: Record<string, string>;
}

const PropertyForm = ({ formData, updateFormData, errors }: PropertyFormProps) => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData("thumbnail", file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className='mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200'>
      <h1 className='text-2xl font-semibold mb-6'>
        Basic Property Information
      </h1>

      {/* Thumbnail Upload */}
      <div className='mb-6'>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Thumbnail <span className="text-red-500">*</span>
        </label>
        <div className={`border-dashed border-2 ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'} p-6 text-center rounded-lg`}>
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='image/png, image/jpeg'
              className='hidden'
              onChange={handleFileChange}
            />
            <div className='text-gray-600'>
              <p>Click to upload thumbnail</p>
              <p className='text-xs'>PNG, JPG up to 10MB</p>
            </div>
          </label>
        </div>
        {errors.thumbnail && (
          <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
        )}
        {/* Display the uploaded thumbnail */}
        {thumbnailPreview && (
          <div className='mt-4 text-center'>
            <Image
              src={thumbnailPreview}
              alt='Uploaded Thumbnail'
              width={200}
              height={200}
              className='max-w-50 max-h-50 mx-auto object-cover rounded'
            />
          </div>
        )}
      </div>

      {/* Property Form Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Property Name <span className="text-red-500">*</span>
          </label>
          <input
            type='text'
            className={`border ${errors.propertyName ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.propertyName}
            onChange={(e) => updateFormData("propertyName", e.target.value)}
            placeholder='Enter property name'
          />
          {errors.propertyName && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type='text'
            className={`border ${errors.address ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            placeholder='Enter full address'
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Property Type <span className="text-red-500">*</span>
          </label>
          <select
            className={`border ${errors.propertyType ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.propertyType}
            onChange={(e) => updateFormData("propertyType", e.target.value)}>
            <option value="">Select your property type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Condo">Condo</option>
            <option value="Land">Land</option>
          </select>
          {errors.propertyType && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Property Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`border ${errors.propertyStatus ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.propertyStatus}
            onChange={(e) => updateFormData("propertyStatus", e.target.value)}>
            <option value="">Select your property status</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="sold">Sold</option>
          </select>
          {errors.propertyStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyStatus}</p>
          )}
        </div>
      </div>

      {/* Overview and Key Features */}
      <div className='mt-8'>
        <div className='flex flex-col mb-6'>
          <label className='font-semibold text-gray-700 mb-2'>
            Overview <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`border ${errors.overview ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            rows={5}
            value={formData.overview}
            onChange={(e) => updateFormData("overview", e.target.value)}
            placeholder='Enter property overview'
          />
          {errors.overview && (
            <p className="text-red-500 text-sm mt-1">{errors.overview}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Key Features <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`border ${errors.keyFeatures ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            rows={5}
            value={formData.keyFeatures}
            onChange={(e) => updateFormData("keyFeatures", e.target.value)}
            placeholder='Enter key features (comma separated)'
          />
          {errors.keyFeatures && (
            <p className="text-red-500 text-sm mt-1">{errors.keyFeatures}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;