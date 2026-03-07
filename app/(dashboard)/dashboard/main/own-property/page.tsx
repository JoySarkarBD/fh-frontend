"use client";

import { useUserOwnProperties } from "@/actions/hooks/property.hooks";
import Pagination from "@/components/pagination/Pagination";
import Card from "@/components/shared/Card/Card";
import { Bath, Bed, Plus, Square } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError,refetch, error } = useUserOwnProperties({
    page,
    limit: 9,
  });

  // Safely extract properties and meta
  const properties = data?.data?.data ?? []; // <-- double data
  const meta = data?.data?.meta;

  if (isError) {
    return <p className="text-center py-10 text-red-500">{error?.message || "Failed to load properties"}</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-5">
        <h1 className="text-[36px]">Own Property</h1>

        <Link href="/dashboard/main/add-property">
          <button className="flex justify-center items-center text-white w-[154px] h-[36px] p-2 rounded-sm cursor-pointer bg-[#619B7F]">
            <Plus size={16} /> Add Property
          </button>
        </Link>
      </div>

      {/* Properties */}
      {isLoading ? (
        <p className="text-center py-10">Loading properties...</p>
      ) : (
        <>
                    {/* <button onClick={()=>{refetch()}}>Refetch</button> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {properties.map((p: any) => (
              <Card
                key={p._id}
                id={p._id}
                imageUrl={p.thumbnail?.image ?? "/property.png"}
                badge={p.status ?? "For Sale"}
                title={p.propertyName} // <-- propertyName in your API
                subtitle={p.address ?? p.overview}
                meta={[
                  { label: "Beds", value: p.bedrooms, icon: Bed },
                  { label: "Baths", value: p.bathrooms, icon: Bath },
                  {
                    label: "Sqft",
                    value: p.squareFeet?.toLocaleString(),
                    icon: Square,
                  },
                ]}
                price={p.price}
                type="property"
                primaryActionLabel="View Details"
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPage > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
              total={meta.total}
              perPage={meta.limit}
              onPageChange={(page) => setPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Page;