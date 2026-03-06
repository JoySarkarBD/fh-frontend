// components/dashboard/property/PropertyDetailsForm.tsx
"use client";
import Image from "next/image";
import { useState } from "react";

interface PropertyDetailsFormProps {
  formData: any;
  updateFormData: (key: string, value: any) => void;
  errors: Record<string, string>;
}

const PropertyDetailsForm = ({ formData, updateFormData, errors }: PropertyDetailsFormProps) => {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      updateFormData("photos", files);
      
      // Create previews
      const previews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };

  return (
    <div className='mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200 mt-5'>
      <h1 className='text-2xl font-semibold mb-6'>Property Details</h1>

      {/* Property Details Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Bedrooms <span className="text-red-500">*</span>
          </label>
          <select
            className={`border ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.bedrooms}
            onChange={(e) => updateFormData("bedrooms", e.target.value)}>
            <option value="">Select number of bedrooms</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
          {errors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Bathrooms <span className="text-red-500">*</span>
          </label>
          <select
            className={`border ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.bathrooms}
            onChange={(e) => updateFormData("bathrooms", e.target.value)}>
            <option value="">Select number of bathrooms</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
          {errors.bathrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Square Feet <span className="text-red-500">*</span>
          </label>
          <input
            type='number'
            className={`border ${errors.squareFeet ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.squareFeet}
            onChange={(e) => updateFormData("squareFeet", e.target.value)}
            placeholder='Enter area square feet'
          />
          {errors.squareFeet && (
            <p className="text-red-500 text-sm mt-1">{errors.squareFeet}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type='number'
            className={`border ${errors.price ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.price}
            onChange={(e) => updateFormData("price", e.target.value)}
            placeholder='Enter property price'
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Lot Area <span className="text-red-500">*</span>
          </label>
          <input
            type='number'
            className={`border ${errors.lotArea ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.lotArea}
            onChange={(e) => updateFormData("lotArea", e.target.value)}
            placeholder='Enter lot area'
          />
          {errors.lotArea && (
            <p className="text-red-500 text-sm mt-1">{errors.lotArea}</p>
          )}
        </div>
        <div className='flex flex-col'>
          <label className='font-semibold text-gray-700 mb-2'>
            Year Built <span className="text-red-500">*</span>
          </label>
          <input
            type='number'
            className={`border ${errors.yearBuilt ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
            value={formData.yearBuilt}
            onChange={(e) => updateFormData("yearBuilt", e.target.value)}
            placeholder='YYYY'
            min="1800"
            max={new Date().getFullYear()}
          />
          {errors.yearBuilt && (
            <p className="text-red-500 text-sm mt-1">{errors.yearBuilt}</p>
          )}
        </div>
      </div>

      {/* More Details */}
      <div className='mt-8'>
        <div className='flex flex-col mb-6'>
          <label className='font-semibold text-gray-700 mb-2'>
            More Details
          </label>
          <textarea
            className='border border-gray-300 p-3 rounded-md'
            rows={5}
            value={formData.moreDetails}
            onChange={(e) => updateFormData("moreDetails", e.target.value)}
            placeholder='Enter additional details about the property'
          />
        </div>
      </div>

      {/* File Upload for Multiple Photos */}
      <div className='mb-6'>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Photos
        </label>
        <div className='border-dashed border-2 border-gray-300 p-6 text-center rounded-lg'>
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='image/png, image/jpeg'
              multiple
              className='hidden'
              onChange={handleFileChange}
            />
            <div className='text-gray-600'>
              <p>Click to upload multiple photos</p>
              <p className='text-xs'>PNG, JPG up to 10MB each</p>
            </div>
          </label>
        </div>
        {photoPreviews.length > 0 && (
          <div className='mt-4'>
            <p className='font-semibold text-gray-700 mb-2'>Uploaded Photos:</p>
            <div className='grid grid-cols-3 md:grid-cols-5 gap-4'>
              {photoPreviews.map((preview, index) => (
                <div key={index} className='relative aspect-square'>
                  <Image
                    src={preview}
                    alt={`Uploaded photo ${index + 1}`}
                    fill
                    className='object-cover rounded-md'
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsForm;