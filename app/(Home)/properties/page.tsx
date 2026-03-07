"use client";

import {
  PropertyListQuery,
  useProperties,
} from "@/actions/hooks/property.hooks";
import PropertyFilter, {
  PropertyFilters,
} from "@/components/home/property/PropertyFilter";
import Pagination from "@/components/pagination/Pagination";
import Card from "@/components/shared/Card/Card";
import { IPropertyResponse } from "@/services/property";
import { Bath, Bed, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_FILTERS: PropertyFilters = {
  minPrice: 0,
  maxPrice: 10000000,
  propertyType: "All Property",
  locationText: "",
  squareFeet: [],
  bedrooms: [],
  bathrooms: [],
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const getMediaUrl = (item?: string | { image?: string } | null) => {
  if (!item) return undefined;
  return typeof item === "string" ? item : item.image;
};

export default function Properties() {
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebouncedValue(filters, 350);
  const limit = 9;
  const locationSearch = debouncedFilters.locationText.trim().toLowerCase();
  const isLocationFiltering = locationSearch.length > 0;

  const handleFilterChange = (nextFilters: PropertyFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const queryParams = useMemo<PropertyListQuery>(() => {
    const type =
      debouncedFilters.propertyType &&
      debouncedFilters.propertyType !== "All Property"
        ? debouncedFilters.propertyType
        : undefined;

    return {
      page: isLocationFiltering ? 1 : page,
      limit: isLocationFiltering ? 500 : limit,
      minPrice: debouncedFilters.minPrice,
      maxPrice: debouncedFilters.maxPrice,
      type,
      squareFeet: debouncedFilters.squareFeet,
      bedrooms: debouncedFilters.bedrooms,
      bathrooms: debouncedFilters.bathrooms,
    };
  }, [debouncedFilters, isLocationFiltering, page]);

  const { data, isLoading, isError, error } = useProperties(queryParams);
  const meta = data?.data?.meta;
  const serverProperties = useMemo(
    () => data?.data?.data ?? [],
    [data?.data?.data],
  );

  const locationFilteredProperties = useMemo(() => {
    if (!isLocationFiltering) return serverProperties;
    return serverProperties.filter((property) => {
      const address = property.address?.toLowerCase() ?? "";
      const mapLink = property.locationMapLink?.toLowerCase() ?? "";
      return (
        address.includes(locationSearch) || mapLink.includes(locationSearch)
      );
    });
  }, [isLocationFiltering, locationSearch, serverProperties]);

  const properties = useMemo(() => {
    if (!isLocationFiltering) return serverProperties;
    const start = (page - 1) * limit;
    return locationFilteredProperties.slice(start, start + limit);
  }, [
    isLocationFiltering,
    limit,
    locationFilteredProperties,
    page,
    serverProperties,
  ]);

  const totalItems = isLocationFiltering
    ? locationFilteredProperties.length
    : (meta?.total ?? 0);
  const totalPages = isLocationFiltering
    ? Math.ceil(totalItems / limit)
    : (meta?.totalPage ?? 0);
  const currentPage = isLocationFiltering ? page : (meta?.page ?? 1);

  return (
    <div className='flex flex-col lg:flex-row justify-center m-5 gap-6 md:mx-12.5 px-6 lg:px-8'>
      <div>
        <PropertyFilter
          value={filters}
          onChange={handleFilterChange}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(1);
          }}
        />
      </div>

      <div className='flex-1'>
        <div className='mb-4 text-sm text-gray-600'>
          Showing {properties.length} of {totalItems || properties.length}{" "}
          properties
        </div>

        {isLoading ? (
          <div className='p-8'>Loading properties...</div>
        ) : isError ? (
          <div className='p-8 text-red-500'>
            {error?.message || "Failed to load properties"}
          </div>
        ) : properties.length === 0 ? (
          <div className='p-8 border border-[#D1CEC6] rounded-md'>
            No properties found for selected filters.
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {properties.map((property: IPropertyResponse) => {
                const id = property._id ?? property.id;
                const thumbnail =
                  getMediaUrl(property.thumbnail) ?? "/property.png";
                const statusLabel =
                  property.status ?? property.propertyStatus ?? "For Sale";

                return (
                  <Card
                    id={id}
                    key={String(id)}
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
                    primaryActionLabel='View Details'
                  />
                );
              })}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={totalItems}
                perPage={limit}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
