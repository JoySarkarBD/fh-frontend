"use client";

import Card from "@/components/shared/Card/Card";
import { Bath, Bed, Square } from "lucide-react";
import { useUserOwnProperties } from "@/actions/hooks/property.hooks";

const Page = () => {
  const { data, isLoading, isError } = useUserOwnProperties({ page: 1, limit: 50 });

  if (isLoading) return <p>Loading properties...</p>;
  if (isError) return <p>Failed to load properties.</p>;

  const properties = data?.data?.data ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[36px]">Sale Property</h1>
      </div>

      <div>
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
           primaryActionLabel={p.isPublished ? "View Details" : "Post Now"} // Use IsPosted instead of isPublished
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Page;