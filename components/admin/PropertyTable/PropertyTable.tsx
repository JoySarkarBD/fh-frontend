"use client";

import Pagination from "@/components/pagination/Pagination";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetAllPropertiesAdmin } from "@/actions/hooks/property.hooks";
import PropertyDetailsModal from "./PropertyDetailsModal";

const PER_PAGE = 13;

export default function PropertyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPropertyId, setModalPropertyId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } =
    useGetAllPropertiesAdmin(currentPage, PER_PAGE);

  const properties = data?.properties ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;
  const totalProperties = meta?.total ?? 0;

  type TableRow = {
    id: string;
    image: string;
    name: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    type: string;
    createdAt: string;
  };

  const tableRows: TableRow[] = properties.map((property) => {
    const thumb = property.thumbnail;
    const thumbnailUrl =
      typeof thumb === "string"
        ? thumb
        : thumb && typeof thumb === "object" && "image" in thumb
          ? thumb.image
          : "/banner.png";

    return {
      id:
        (property._id ? String(property._id) : "") ||
        (property.id ? String(property.id) : ""),
      image: thumbnailUrl,
      name: property.propertyName || "Untitled",
      address: property.address ?? "N/A",
      bedrooms: typeof property.bedrooms === "number" ? property.bedrooms : 0,
      bathrooms:
        typeof property.bathrooms === "number" ? property.bathrooms : 0,
      squareFeet:
        typeof property.squareFeet === "number" ? property.squareFeet : 0,
      type: property.propertyType ?? "N/A",
      createdAt: property.createdAt
        ? new Date(property.createdAt).toLocaleDateString()
        : "N/A",
    };
  });

  if (isLoading && !data) {
    return (
      <div className='flex flex-col items-center justify-center min-h-100 gap-4'>
        <Loader2 className='h-10 w-10 animate-spin text-gray-500' />
        <p className='text-gray-600'>Loading properties...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200'>
        <p className='font-medium'>Failed to load properties</p>
        <p className='text-sm mt-2'>
          {error?.message || "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6]'>
      {/* Page title */}
      <div className='px-6 py-5'>
        <h1 className='text-xl md:text-2xl  border-b border-[#D1CEC6] pb-3 '>
          Property Management
        </h1>
      </div>

      {/* Table */}
      <div className='overflow-x-auto px-5'>
        <table className='w-full text-sm text-[#1B1B1A]'>
          <thead>
            <tr className='border border-[#D1CEC6]'>
              <th className='px-4 py-3 text-left font-medium w-20 border border-[#E8E5DD]'>
                Property
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Property Name
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Address
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Bed rooms
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Bathroom
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Square Feet
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Type
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Created At
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='border border-[#D1CEC6]'>
            {tableRows.length > 0 ? (
              tableRows.map((property) => (
                <tr
                  key={property.id}
                  className='border border-[#E8E5DD] hover:bg-gray-50 transition-colors'>
                  {/* Thumbnail */}
                  <td className='px-4 py-3 border border-[#E8E5DD]'>
                    <div className='w-12 h-10 rounded overflow-hidden bg-gray-100 shrink-0'>
                      <Image
                        src={property.image}
                        alt={property.name}
                        width={48}
                        height={40}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </td>

                  {/* Name */}
                  <td className='px-4 py-3 font-medium text-[#70706C] border border-[#E8E5DD]'>
                    {property.name}
                  </td>

                  {/* Address */}
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.address}
                  </td>

                  {/* Bedrooms */}
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.bedrooms}
                  </td>

                  {/* Bathrooms */}
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.bathrooms}
                  </td>

                  {/* Square Feet */}
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.squareFeet}
                  </td>

                  {/* Type badge */}
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    <span className='inline-flex items-center px-3 py-1 rounded-lg border border-[#D1CEC6] text-[12px] text-(--primary-text-color) bg-[#F8FAF9] whitespace-nowrap'>
                      Type: {property.type}
                    </span>
                  </td>

                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.createdAt}
                  </td>

                  {/* Action */}
                  <td className='px-4 py-3 border border-[#E8E5DD]'>
                    <button
                      onClick={() => setModalPropertyId(property.id || "")}
                      className='text-sm text-[#1B1B1A] underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap cursor-pointer'>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className='px-6 py-10 text-center text-gray-500'>
                  No properties found at the moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='px-4 py-4 text-sm text-gray-600'>
        <p className='mb-3'>
          Showing {tableRows.length} of {totalProperties} properties
          {isFetching ? " • Updating..." : ""}
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalProperties}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      <PropertyDetailsModal
        propertyId={modalPropertyId || ""}
        open={!!modalPropertyId}
        onClose={() => setModalPropertyId(null)}
      />
    </div>
  );
}
