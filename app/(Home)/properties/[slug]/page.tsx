'use client';

import { useUserProfile } from "@/actions/hooks/auth.hooks";
import {
  useDeletePropertyMutation,
  useIsPropertySaved,
  usePropertyById,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from "@/actions/hooks/property.hooks";
import Gallery from "@/components/home/property/Gallery";
import Location from "@/components/home/property/Location";
import ViewButton from "@/components/shared/ViewButton/ViewButton";
import { Bath, Bed, Heart, MapPin, MessageCircleMore, Pencil, Square, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface UserLike {
  _id?: string;
  id?: string;
}

interface PropertyOwnerLike {
  _id?: string;
  id?: string;
}


// Helper function to safely get property owner ID
const getPropertyOwnerId = (propertyOwner: PropertyOwnerLike | string | number | undefined): string => {
  if (!propertyOwner) return "";
  
  // If it's an object with _id or id
  if (typeof propertyOwner === "object") {
    return String(propertyOwner._id ?? propertyOwner.id ?? "");
  }
  
  // If it's a string or number
  return String(propertyOwner);
};

export default function Page() {
  const router = useRouter();
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const { data, isLoading, isError, error } = usePropertyById(slug ?? "");
  const { data: userProfile } = useUserProfile();
  const property = data?.data;
  const propertyId = String(property?._id ?? property?.id ?? "");
  
  // Safely get current user ID
  const currentUserId = String(
    (userProfile && typeof userProfile === "object" 
      ? (userProfile as UserLike)._id ?? (userProfile as UserLike).id ?? "" 
      : "")
  );
  
  // Safely get property owner ID
  const propertyOwnerId = getPropertyOwnerId(property?.propertyOwner);
  
  const isOwner =
    Boolean(currentUserId) &&
    Boolean(propertyOwnerId) &&
    currentUserId === propertyOwnerId;

  const {
    data: isSavedResponse,
    refetch: refetchSavedState,
  } = useIsPropertySaved(propertyId, {
    enabled: Boolean(propertyId) && Boolean(currentUserId) && !isOwner,
  });
  const isSaved = Boolean(isSavedResponse?.data?.isSaved);

  const savePropertyMutation = useSavePropertyMutation({
    onSuccess: () => {
      void refetchSavedState();
    },
  });
  const unsavePropertyMutation = useUnsavePropertyMutation({
    onSuccess: () => {
      void refetchSavedState();
    },
  });

  const deletePropertyMutation = useDeletePropertyMutation({
    onSuccess: () => {
      router.push("/dashboard/main/own-property");
      router.refresh();
    },
  });

  const keyFeatures = property?.keyFeatures
    ? property.keyFeatures
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const moreDetailsParts = property?.moreDetails
    ? property.moreDetails
        .split(/\r?\n\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const interiorDetails = moreDetailsParts[0] ?? property?.moreDetails ?? "N/A";
  const exteriorDetails = moreDetailsParts[1] ?? "N/A";

  const thumbnailImage =
    typeof property?.thumbnail === "string"
      ? property.thumbnail
      : property?.thumbnail?.image;

  const propertyImages = ((property?.images ?? []) as Array<string | { image?: string }>)
    .map((image) => (typeof image === "string" ? image : image?.image))
    .filter((image): image is string => typeof image === "string" && image.length > 0);

  const galleryImages = [
    ...(thumbnailImage ? [thumbnailImage] : []),
    ...propertyImages,
  ].filter((image, index, arr) => arr.indexOf(image) === index);

  if (isLoading) return <div className='p-8'>Loading property...</div>;
  if (isError) {
    return <div className='p-8 text-red-500'>{error?.message || "Failed to load property"}</div>;
  }
  if (!property) return <div className='p-8'>Property not found</div>;

  const handleDelete = () => {
    if (!propertyId || deletePropertyMutation.isPending) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this property?");
    if (!isConfirmed) return;

    deletePropertyMutation.mutate(propertyId);
  };

  const handleToggleSave = () => {
    if (!propertyId) return;
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (savePropertyMutation.isPending || unsavePropertyMutation.isPending) return;
    if (isSaved) {
      unsavePropertyMutation.mutate(propertyId);
    } else {
      savePropertyMutation.mutate(propertyId);
    }
  };

  return (
    <div className='md:mx-12.5 px-6 lg:px-8 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 border border-[#D1CEC6] p-5 rounded-md '>
        <div className='lg:col-span-2'>
          <Gallery images={galleryImages} />
        </div>

        <aside className='lg:col-span-2'>
          <div className=' bg-white rounded-md px-6'>
            <div>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h1 className='text-2xl md:text-4xl font-normal pb-6'>{property.propertyName}</h1>
                  <div className='flex items-center justify-start gap-x-4 text-(--primary-text-color) pb-4'>
                    <p className='text-sm bg-[#F8FAF9] border border-[#D1CEC6] rounded-lg px-2 py-1'>
                      Status: {property.propertyStatus ?? "sale"}
                    </p>
                    <p className='text-sm bg-[#F8FAF9] border border-[#D1CEC6] rounded-lg px-2 py-1'>
                      Type: Property
                    </p>
                  </div>
                  {property.locationMapLink && (
                    <div className='text-sm text-(--primary-text-color) mt-2 flex items-center gap-1'>
                      <MapPin className='h-5 w-5' />
                      <p>{property.locationMapLink}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='mt-4'>
                <div className='grid  md:flex gap-4 text-sm text-gray-600 mt-3 p-1'>
                  <div className='flex items-center gap-2'>
                    <Bed className='h-4 w-4 text-(--primary-text-color) ' />
                    <p>{property.bedrooms} Beds</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Bath className='h-4 w-4 text-(--primary-text-color)' />
                    <p>{property.bathrooms} Baths</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Square className='h-4 w-4 text-(--primary-text-color)' />
                    <p>{property.squareFeet.toLocaleString()} Sqft</p>
                  </div>
                  <div>
                    <p className='text-(--primary-text-color)'>
                      Year Built: <span className='text-gray-600'>{property.yearBuilt}</span>
                    </p>
                  </div>
                  <div>
                    <p className='text-(--primary-text-color)'>
                      Lot: <span className='text-gray-600'>{property.lotSize} Sqft</span>
                    </p>
                  </div>
                </div>

                <div className='flex gap-4 text-sm text-gray-600 mt-3'></div>

                {property.overview && (
                  <div className='mt-4'>
                    <h3 className='text-[24px]'>Overview</h3>
                    <p className='text-sm text-gray-700 mt-4'>{property.overview}</p>
                  </div>
                )}

                {keyFeatures.length > 0 && (
                  <div className='mt-13'>
                    <h3 className='text-[24px]'>Key Features</h3>
                    <ul className='text-sm text-gray-700 mt-4 space-y-1'>
                      {keyFeatures.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className='flex flex-col md:flex-row items-start md:items-center justify-start gap-x-25 gap-y-2 text-(--primary-text-color) pb-4 mt-6'>
                  <div className='text-3xl md:text-5xl text-(--primary-text-color) '>
                    <p>
                      Price: $
                      {property.price.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  {isOwner ? (
                    <div className='flex items-center justify-center text-center gap-x-4'>
                      <ViewButton
                        icon={<Pencil className='h-5 w-5' />}
                        label='Edit'
                        href={`/dashboard/main/own-property/update/${property._id ?? property.id}`}
                        className='flex flex-row items-center justify-center'
                      />
                      <button
                        type='button'
                        onClick={handleDelete}
                        disabled={deletePropertyMutation.isPending}
                        className='border border-red-300 text-red-600 rounded-lg p-3 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        aria-label='Delete property'>
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center text-center gap-x-4'>
                      <ViewButton
                        icon={<MessageCircleMore className='h-5 w-5' />}
                        label='Message'
                        href={
                          propertyOwnerId
                            ? `/dashboard/profile/message?userId=${propertyOwnerId}&propertyId=${propertyId}`
                            : "/dashboard/profile/message"
                        }
                        className='flex flex-row items-center justify-center'
                      />
                      <button
                        type='button'
                        onClick={handleToggleSave}
                        disabled={
                          savePropertyMutation.isPending ||
                          unsavePropertyMutation.isPending
                        }
                        className='border border-[#D1CEC6] rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed'
                        aria-label={isSaved ? "Unsave property" : "Save property"}>
                        <Heart
                          className={isSaved ? "fill-red-500 text-red-500" : "text-(--primary)"}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div>
        <div className='mt-8 bg-white shadow border border-[#D1CEC6] p-5 rounded-lg'>
          <h2 className='text-4xl mb-3 border-b border-[#D1CEC6] pb-2 '>More details</h2>
          <div>
            <p className='text-2xl'>Interior</p>
            <p className='text-sm text-gray-700 pt-5'>{interiorDetails}</p>
          </div>
          <div>
            <p className='text-2xl pt-6'>Exterior</p>
            <p className='text-sm text-gray-700 pt-5'>{exteriorDetails}</p>
          </div>
        </div>

        <div className='mt-8 border border-[#D1CEC6] p-5 rounded-lg'>
          <h2 className='text-4xl mb-3 border-b border-[#D1CEC6] pb-2 '>Location</h2>
          <Location address={property.locationMapLink} />
        </div>
      </div>
    </div>
  );
}