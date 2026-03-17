"use client";

import Card from "@/components/shared/Card/Card";
import { Bath, Bed, Square } from "lucide-react";

import { useGetTopFourProperty } from "@/actions/hooks/property.hooks";
import properties from "@/lib/propertyData";

const Discover = () => {
  const { data } = useGetTopFourProperty();
  const apiProperties = data?.data?.data;

  const normalizeProperty = (p: any) => {
    const source = p?._doc ?? p;
    const thumbnail = source?.thumbnail?.image;
    console.log(thumbnail, 'this is source');

    const imageUrl =
      (typeof thumbnail === "string" && thumbnail) ||
      (typeof thumbnail === "object" && thumbnail?.image) ||
      (Array.isArray(source.images) &&
        ((typeof source.images[0] === "string" && source.images[0]) ||
          (typeof source.images[0] === "object" && source.images[0]?.image))) ||
      "/property.png";

    return {
      id: source.id ?? source._id,
      title: source.propertyName ?? source.title,
      address: source.address,
      status: source.status,
      bedrooms: source.bedrooms,
      bathrooms: source.bathrooms,
      squareFeet: source.squareFeet ?? source.sqft,
      price: source.price,
      imageUrl,
      thumbnail
    };
  };

  const recentProperties = (apiProperties ?? properties)
    .slice(0, 4)
    .map(normalizeProperty);

  return (
    <section className='py-8'>
      <div className='md:mx-12.5 px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {recentProperties.map((p) => (
            <Card
              id={p.id}
              key={p.id}
              imageUrl={p.thumbnail}
              badge={p.status ?? "For Sale"}
              title={p.title}
              subtitle={p.address}
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
              type={"property"}
              primaryActionLabel='View Details'
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Discover;
