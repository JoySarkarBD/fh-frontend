"use client";

import { useGetAllPropertiesAdmin } from "@/actions/hooks/property.hooks";
import Image from "next/image";
import Link from "next/link";

export default function RecentCreatedProperties() {
  // Fetch all properties (large limit to get all)
  const { data } = useGetAllPropertiesAdmin(1, 1000);
  const properties = data?.properties ?? [];
  // Sort by createdAt descending and take 9 most recent
  const recent = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 9);

  // Map to table row format (like PropertyTable)
  const tableRows = recent.map((property) => {
    const thumb = property.thumbnail || property.images?.[0];
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
        typeof property.squareFeet === "number"
          ? property.squareFeet
          : (property.squareFeet ?? 0),
      type: property.propertyType ?? "N/A",
      createdAt: property.createdAt
        ? new Date(property.createdAt).toLocaleDateString()
        : "N/A",
    };
  });

  return (
    <div className='mt-6 border border-[#D1CEC6] rounded-lg p-5'>
      <p className='text-xl md:text-2xl border-b border-[#D1CEC6] pb-3 mb-4'>
        Recently Created Properties
      </p>
      <div className='overflow-x-auto'>
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
                  <td className='px-4 py-3 font-medium text-[#70706C] border border-[#E8E5DD]'>
                    {property.name}
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.address}
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.bedrooms}
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.bathrooms}
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.squareFeet}
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    <span className='inline-flex items-center px-3 py-1 rounded-lg border border-[#D1CEC6] text-[12px] text-(--primary-text-color) bg-[#F8FAF9] whitespace-nowrap'>
                      Type: {property.type}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                    {property.createdAt}
                  </td>
                  <td className='px-4 py-3 border border-[#E8E5DD]'>
                    <Link
                      href={`/properties/${property.id}`}
                      className='text-sm text-[#1B1B1A] underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap'>
                      View Details
                    </Link>
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
    </div>
  );
}
