'use client'

import {
  usePropertyById,
  useUpdatePropertyMutation,
  useUserOwnProperties,
} from '@/actions/hooks/property.hooks';
import PropertyDetailsForm from '@/components/dashboard/property/PropertyDetailsForm';
import PropertyForm from '@/components/dashboard/property/PropertyForm';
import { IPropertyResponse, PropertyStatus } from '@/services/property';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type UpdatePropertyFormData = {
  propertyName: string;
  address: string;
  propertyType: string;
  propertyStatus: PropertyStatus | '';
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
  sellPostingDate: string;
  sellPostingTime: string;
  isPublished: boolean;
};

const EMPTY_FORM: UpdatePropertyFormData = {
  propertyName: '',
  address: '',
  propertyType: '',
  propertyStatus: '' as PropertyStatus,
  overview: '',
  keyFeatures: '',
  thumbnail: undefined,
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  price: '',
  lotArea: '',
  yearBuilt: '',
  moreDetails: '',
  photos: [],
  locationMapLink: '',
  sellPostingDate: '',
  sellPostingTime: '',
  isPublished: false,
};

const getMediaUrl = (item?: string | { image?: string } | null) => {
  if (!item) return '';
  return typeof item === 'string' ? item : item.image || '';
};

const toDateInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const UpdatePropertyPage = () => {
  const params = useParams<{ id: string }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<UpdatePropertyFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchPropertyById,
  } = usePropertyById(propertyId || '');
  const property = data?.data as IPropertyResponse | undefined;

  const { refetch: refetchUserProperties } = useUserOwnProperties({ page: 1, limit: 9 });

  const updateProperty = useUpdatePropertyMutation({
    onSuccess: () => {
      refetchUserProperties();
      refetchPropertyById();
      alert('Property updated successfully!');
    },
    onError: (err: Error) => {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    },
  });

  const existingThumbnailUrl = useMemo(
    () => getMediaUrl(property?.thumbnail),
    [property?.thumbnail]
  );
  const existingImages = useMemo(
    () =>
      (property?.images || [])
        .map((item) => getMediaUrl(item as string | { image?: string } | null))
        .filter(Boolean),
    [property?.images]
  );

  useEffect(() => {
    if (!property || isInitialized) return;

    const nextFormData: UpdatePropertyFormData = {
      propertyName: property.propertyName || '',
      address: property.address || '',
      propertyType: property.propertyType || '',
      propertyStatus: (property.status || property.propertyStatus || '') as PropertyStatus,
      overview: property.overview || '',
      keyFeatures: property.keyFeatures || '',
      thumbnail: undefined,
      bedrooms: String(property.bedrooms || ''),
      bathrooms: String(property.bathrooms || ''),
      squareFeet: String(property.squareFeet || ''),
      price: String(property.price || ''),
      lotArea: String(property.lotSize || ''),
      yearBuilt: String(property.yearBuilt || ''),
      moreDetails: property.moreDetails || '',
      photos: [],
      locationMapLink: property.locationMapLink || '',
      sellPostingDate: toDateInput(property.sellScheduleAt),
      sellPostingTime: toTimeInput(property.sellScheduleAt),
      isPublished: Boolean(property.isPublished),
    };

    const timer = setTimeout(() => {
      setFormData(nextFormData);
      setIsInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [property, isInitialized]);

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value as UpdatePropertyFormData[keyof UpdatePropertyFormData],
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.propertyName) nextErrors.propertyName = 'Property name is required';
    if (!formData.address) nextErrors.address = 'Address is required';
    if (!formData.propertyType) nextErrors.propertyType = 'Property type is required';
    if (!formData.propertyStatus) nextErrors.propertyStatus = 'Property status is required';
    if (!formData.overview) nextErrors.overview = 'Overview is required';
    if (!formData.keyFeatures) nextErrors.keyFeatures = 'Key features is required';
    if (!formData.bedrooms) nextErrors.bedrooms = 'Bedrooms is required';
    if (!formData.bathrooms) nextErrors.bathrooms = 'Bathrooms is required';
    if (!formData.squareFeet) nextErrors.squareFeet = 'Square feet is required';
    if (!formData.price) nextErrors.price = 'Price is required';
    if (!formData.lotArea) nextErrors.lotArea = 'Lot area is required';
    if (!formData.yearBuilt) nextErrors.yearBuilt = 'Year built is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = useMemo(() => {
    return {
      propertyName: formData.propertyName,
      address: formData.address,
      propertyType: formData.propertyType,
      propertyStatus: formData.propertyStatus as PropertyStatus,
      overview: formData.overview,
      keyFeatures: formData.keyFeatures,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      squareFeet: Number(formData.squareFeet),
      lotSize: Number(formData.lotArea),
      price: Number(formData.price),
      yearBuilt: Number(formData.yearBuilt),
      moreDetails: formData.moreDetails,
      locationMapLink:
        formData.locationMapLink ||
        `https://maps.google.com/?q=${encodeURIComponent(formData.address)}`,
      sellPostingDate: formData.sellPostingDate || undefined,
      sellPostingTime: formData.sellPostingTime || undefined,
      isPublished: formData.isPublished,
      ...(formData.thumbnail ? { thumbnail: formData.thumbnail } : {}),
      ...(formData.photos.length ? { images: formData.photos } : {}),
    };
  }, [formData]);

  const handleSubmit = () => {
    if (!propertyId) return;
    if (!validateForm()) return;

    updateProperty.mutate({ id: propertyId, data: payload });
  };

  if (!propertyId) return <div className='p-8'>Invalid property id.</div>;
  if (isLoading) return <div className='p-8'>Loading property...</div>;
  if (isError) return <div className='p-8 text-red-500'>{error?.message || 'Failed to load property'}</div>;

  return (
    <div className='container mx-auto px-4'>
      <div className='space-y-6'>
        <PropertyForm
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          showScheduleFields={true}
          showPublishToggle={true}
          existingThumbnailUrl={existingThumbnailUrl}
          existingImagesUrls={existingImages}
        />

        <PropertyDetailsForm
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />

        {errors.submit && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-red-600'>{errors.submit}</p>
          </div>
        )}

        <div className='flex justify-end gap-4'>
          <button
            onClick={handleSubmit}
            disabled={updateProperty.isPending}
            className='px-6 py-3 bg-[#619B7F] text-white rounded-md hover:bg-[#4a7b63] transition disabled:opacity-50 disabled:cursor-not-allowed'>
            {updateProperty.isPending ? 'Updating Property...' : 'Update Property'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePropertyPage;
