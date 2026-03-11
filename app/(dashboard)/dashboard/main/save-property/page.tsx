"use client";

import {
  useSavedProperties,
  useUnsavePropertyMutation,
} from "@/actions/hooks/property.hooks";
import Card from "@/components/shared/Card/Card";
import { ISavedPropertyItem } from "@/services/property";
import { Bath, Bed, Square, Trash2 } from "lucide-react";

const getMediaUrl = (item?: string | { image?: string } | null) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.image || "";
};

const SavePropertyPage = () => {
  const { data, isLoading, isError, error } = useSavedProperties({
    page: 1,
    limit: 100,
  });

  const unsaveMutation = useUnsavePropertyMutation();
  const savedRows: ISavedPropertyItem[] = data?.data?.data ?? [];

  return (
    <div>
      <div className='mb-5'>
        <h1 className='text-[36px]'>Save Property</h1>
      </div>

      {isLoading ? (
        <p className='py-8'>Loading saved properties...</p>
      ) : isError ? (
        <p className='py-8 text-red-500'>
          {error?.message || "Failed to load saved properties"}
        </p>
      ) : savedRows.length === 0 ? (
        <p className='py-8 text-gray-600'>No saved properties yet.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {savedRows.map((row) => {
            const property = row.property;
            const propertyId = property._id ?? property.id;
            const thumbnail = getMediaUrl(property.thumbnail) || "/property.png";
            const statusLabel =
              property.status ?? property.propertyStatus ?? "For Sale";

            return (
              <Card
                id={propertyId}
                key={String(row.id)}
                imageUrl={thumbnail}
                badge={String(statusLabel)}
                title={property.propertyName}
                subtitle={property.address || property.overview}
                meta={[
                  { label: "Beds", value: property.bedrooms, icon: Bed },
                  { label: "Baths", value: property.bathrooms, icon: Bath },
                  {
                    label: "Sqft",
                    value: property.squareFeet?.toLocaleString(),
                    icon: Square,
                  },
                ]}
                price={property.price}
                type='property'
                primaryActionLabel='View Details'>
                <button
                  type='button'
                  onClick={() => unsaveMutation.mutate(String(propertyId))}
                  disabled={unsaveMutation.isPending}
                  className='inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                  <Trash2 className='h-4 w-4' />
                  Remove
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavePropertyPage;
