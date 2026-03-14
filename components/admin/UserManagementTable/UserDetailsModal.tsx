"use client";
import { useGetUserById } from "@/actions/hooks/user.hooks";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface UserDetailsModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({
  userId,
  open,
  onClose,
}: UserDetailsModalProps) {
  const { data: user, isLoading, isError, error } = useGetUserById(userId);

  useEffect(() => {
    if (!open) return;
    // Optionally, focus modal or trap focus
  }, [open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-[#D1CEC6]'>
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-700'
          onClick={onClose}
          aria-label='Close'>
          <X className='w-5 h-5' />
        </button>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          User Details
        </h2>
        {isLoading ? (
          <div className='flex flex-col items-center gap-2 py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='text-gray-500'>Loading...</span>
          </div>
        ) : isError ? (
          <div className='text-red-600 bg-red-50 p-4 rounded'>
            {error?.message || "Failed to load user details."}
          </div>
        ) : user ? (
          <div className='flex flex-col items-center gap-4'>
            <div className='w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200'>
             <Image
  src={
    typeof user.profileImage === "string"
      ? user.profileImage
      : user.profileImage?.image || "/user.png"
  }
  alt={user.name || "User"}
  width={80}
  height={80}
  className='w-full h-full object-cover'
/>
            </div>
            <div className='w-full'>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>Name:</span>{" "}
                {user.name || "N/A"}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>Email:</span>{" "}
                {user.email || "N/A"}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>Phone:</span>{" "}
                {user.phone || "N/A"}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>Address:</span>{" "}
                {user.homeAddress || user.officeAddress || "N/A"}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>Subscription:</span>{" "}
                {user.isSubscribed ? "Premium" : "Free"}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>
                  Properties Own:
                </span>{" "}
                {user.propertiesOwn ?? 0}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>
                  Properties Buy:
                </span>{" "}
                {user.propertiesBuy ?? 0}
              </div>
              <div className='mb-2'>
                <span className='font-medium text-gray-700'>
                  Properties Sell:
                </span>{" "}
                {user.propertiesSell ?? 0}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
