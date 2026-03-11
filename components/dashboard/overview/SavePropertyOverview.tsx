"use client";

import { useSavedPropertyOverview } from "@/actions/hooks/property.hooks";
import { BathIcon, Bed, MapPin, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getMediaUrl = (item?: string | { image?: string } | null) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.image || "";
};

export const SavePropertyOverview = () => {
  const router = useRouter();
  const { data, isLoading, isError, error } = useSavedPropertyOverview();
  const rows = data?.data?.recentSaved ?? [];

  return (
    <div className='p-4 bg-white rounded-md shadow-md border-2 border-[#D1CEC6]'>
      <div className='flex justify-between border-b border-[#D1CEC6] mb-3'>
        <h1 className='text-[24px]'>Save Property</h1>
        <Link
          href='/dashboard/main/save-property'
          className='text-[#0284C7] text-[24px] mb-2 cursor-pointer'>
          View All
        </Link>
      </div>

      {isLoading ? (
        <p className='py-6 text-sm text-gray-600'>Loading saved properties...</p>
      ) : isError ? (
        <p className='py-6 text-sm text-red-500'>
          {error?.message || "Failed to load saved properties"}
        </p>
      ) : rows.length === 0 ? (
        <p className='py-6 text-sm text-gray-600'>No saved properties found.</p>
      ) : (
        <div className='flex flex-col space-y-4'>
          {rows.map((row) => {
            const property = row.property;
            const id = String(property._id ?? property.id ?? "");
            const thumbnail = getMediaUrl(property.thumbnail) || "/property.png";
            return (
              <div
                key={row.id}
                className='flex flex-col lg:flex-row md:items-center lg:space-x-4 border border-[#D1CEC6] p-3 rounded-lg'>
                <Image
                  src={thumbnail}
                  alt={property.propertyName || "Property"}
                  width={150}
                  height={150}
                  className='object-cover w-62.5 md:w-37.5 h-auto rounded-md'
                />
                <div className='flex-1 mt-2 md:mt-0'>
                  <h3 className='text-lg font-semibold'>
                    {property.propertyName || "Property"}
                  </h3>
                  <div className='flex gap-0.5'>
                    <MapPin size={20} />
                    <p className='text-sm text-gray-500'>
                      {property.address || "Address not available"}
                    </p>
                  </div>
                  <div className='flex space-x-4 text-sm text-gray-600 mt-1'>
                    <div className='flex gap-0.5'>
                      <Bed size={20} />
                      <p>{property.bedrooms ?? 0} Beds</p>
                    </div>
                    <div className='flex gap-0.5'>
                      <BathIcon size={20} />
                      <p>{property.bathrooms ?? 0} Baths</p>
                    </div>
                    <div className='flex gap-0.5'>
                      <Square size={20} />
                      <p>{property.squareFeet ?? 0} Sqft</p>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col mt-5 md:mt-0'>
                  <span className='text-xl font-bold text-gray-900'>
                    ${Number(property.price ?? 0).toLocaleString("en-US")}
                  </span>
                  <button
                    type='button'
                    onClick={() => router.push(`/properties/${id}`)}
                    className='mt-2 underline cursor-pointer text-left'>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
