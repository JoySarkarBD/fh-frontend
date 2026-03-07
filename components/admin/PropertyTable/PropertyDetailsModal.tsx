"use client";

import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useMemo } from "react";
import { useGetPropertyById } from "@/actions/hooks/property.hooks";
import { getUserById } from "@/lib/userData";

interface PropertyDetailsModalProps {
  propertyId: string;
  open: boolean;
  onClose: () => void;
}

function getImageUrl(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "image" in value) {
    const maybeImage = (value as { image?: unknown }).image;
    return typeof maybeImage === "string" ? maybeImage : "/banner.png";
  }

  return "/banner.png";
}

export default function PropertyDetailsModal({
  propertyId,
  open,
  onClose,
}: PropertyDetailsModalProps) {
  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useGetPropertyById(propertyId || undefined);

  const galleryImages = useMemo((): string[] => {
    if (!property || !property.images) return [];

    const imgs = Array.isArray(property.images) ? property.images : [];

    return imgs
      .map((img) => getImageUrl(img))
      .filter((url) => url && url !== "/banner.png");
  }, [property]);

  const ownerEmail = useMemo((): string => {
    if (!property) return "N/A";

    if (property.propertyOwnerEmail) {
      return property.propertyOwnerEmail;
    }

    if (!property.propertyOwner) return "N/A";

    let id: string | number = property.propertyOwner;

    if (typeof id === "string") {
      const num = Number(id);
      if (!Number.isNaN(num)) id = num;
    }

    const user = getUserById(id as number);
    return user?.email || "N/A";
  }, [property]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative border border-[#D1CEC6] max-h-[90vh] overflow-y-auto'>
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer'
          onClick={onClose}
          aria-label='Close'>
          <X className='w-5 h-5' />
        </button>

        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Property Details
        </h2>

        {isLoading ? (
          <div className='flex flex-col items-center gap-2 py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='text-gray-500'>Loading...</span>
          </div>
        ) : isError ? (
          <div className='text-red-600 bg-red-50 p-4 rounded'>
            {error?.message || "Failed to load property details."}
          </div>
        ) : property ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <div className='w-full h-52 rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                <Image
                  src={getImageUrl(property.thumbnail)}
                  alt={property.propertyName || "Property"}
                  width={700}
                  height={400}
                  className='w-full h-full object-cover'
                />
              </div>

              {galleryImages.length > 0 && (
                <div className='mt-3 flex gap-2 overflow-x-auto'>
                  {galleryImages.map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      className='shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-50'>
                      <Image
                        src={src}
                        alt={`Thumb ${idx + 1}`}
                        width={280}
                        height={180}
                        className='object-cover w-full h-full'
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='space-y-2 text-sm text-gray-700'>
              <div>
                <span className='font-medium text-gray-800'>Name:</span>{" "}
                {property.propertyName || "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Owner Email:</span>{" "}
                {ownerEmail}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Status:</span>{" "}
                {property.status || property.propertyStatus || "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Type:</span>{" "}
                {property.propertyType || "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Address:</span>{" "}
                {property.address || "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Price:</span>{" "}
                {typeof property.price === "number"
                  ? property.price.toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Bedrooms:</span>{" "}
                {property.bedrooms ?? 0}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Bathrooms:</span>{" "}
                {property.bathrooms ?? 0}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Square Feet:</span>{" "}
                {property.squareFeet ?? 0}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Lot Size:</span>{" "}
                {property.lotSize ?? 0}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Year Built:</span>{" "}
                {property.yearBuilt ?? "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Published:</span>{" "}
                {property.isPublished ? "Yes" : "No"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Created At:</span>{" "}
                {property.createdAt
                  ? new Date(property.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span className='font-medium text-gray-800'>Updated At:</span>{" "}
                {property.updatedAt
                  ? new Date(property.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            <div className='md:col-span-2 space-y-3 text-sm text-gray-700'>
              <div>
                <p className='font-medium text-gray-800 mb-1'>Overview</p>
                <p className='whitespace-pre-wrap wrap-break-word'>
                  {property.overview || "N/A"}
                </p>
              </div>

              <div>
                <p className='font-medium text-gray-800 mb-1'>Key Features</p>
                <p className='whitespace-pre-wrap wrap-break-word'>
                  {property.keyFeatures || "N/A"}
                </p>
              </div>

              <div>
                <p className='font-medium text-gray-800 mb-1'>More Details</p>
                <p className='whitespace-pre-wrap wrap-break-word'>
                  {property.moreDetails || "N/A"}
                </p>
              </div>

              <div>
                <p className='font-medium text-gray-800 mb-1'>Map Link</p>
                {property.locationMapLink ? (
                  <a
                    href={property.locationMapLink}
                    target='_blank'
                    rel='noreferrer'
                    className='text-[#619B7F] underline underline-offset-2'>
                    Open Location
                  </a>
                ) : (
                  <p>N/A</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
