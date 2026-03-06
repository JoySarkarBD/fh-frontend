"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGetAllUsersAdmin } from "../../../actions/hooks/user.hooks";
import Pagination from "@/components/pagination/Pagination";
import { Loader2 } from "lucide-react";

const PER_PAGE = 9;

export default function UserManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Use the real API hook
  const { data, isLoading, isError, error } = useGetAllUsersAdmin(
    currentPage,
    PER_PAGE,
    "", // search term
  );

  // Extract real data from API response
  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalUsers = pagination?.total ?? 0;

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-100 gap-4'>
        <Loader2 className='h-10 w-10 animate-spin text-gray-500' />
        <p className='text-gray-600'>Loading users...</p>
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className='p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200'>
        <p className='font-medium'>Failed to load users</p>
        <p className='text-sm mt-2'>
          {error?.message || "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  // ── Empty state ──
  if (users.length === 0) {
    return (
      <div className='p-8 text-center text-gray-500'>
        No users found at the moment.
      </div>
    );
  }

  // ── Prepare table data (map backend shape → your table shape) ──
  const tableRows = users.map((user) => ({
    id: user._id,
    image: "/avatar.png", // ← change when backend sends profileImage
    profileName: user.name || "Unknown",
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    address: user.homeAddress || user.officeAddress || "N/A",
    subscription: "Free", // ← update when you add isSubscribed to backend
    propertiesOwn: 0, // ← update when backend provides these counts
    propertiesBuy: 0,
    propertiesSell: 0,
  }));

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6]'>
      {/* Page title */}
      <div className='px-6 py-5'>
        <h1 className='text-xl md:text-2xl border-b border-[#D1CEC6] pb-3'>
          User Management
        </h1>
      </div>

      {/* Table */}
      <div className='overflow-x-auto px-5'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border border-[#D1CEC6]'>
              <th className='px-4 py-3 text-left font-medium w-28 border border-[#E8E5DD]'>
                Profile
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                User Name
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Email Address
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Phone
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Address
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Subscription
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Properties Own
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Properties Buy
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Properties Sell
              </th>
              <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='border border-[#D1CEC6]'>
            {tableRows.map((user) => (
              <tr key={user.id} className='hover:bg-gray-50 transition-colors'>
                {/* Profile Image */}
                <td className='px-4 py-3 border border-[#E8E5DD]'>
                  <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0'>
                    <Image
                      src={user.image}
                      alt={user.profileName}
                      width={40}
                      height={40}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </td>

                {/* Name */}
                <td className='px-4 py-3 font-medium text-[#70706C] border border-[#E8E5DD]'>
                  {user.profileName}
                </td>

                {/* Email */}
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.email}
                </td>

                {/* Phone */}
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.phone}
                </td>

                {/* Address */}
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.address}
                </td>

                {/* Subscription */}
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-2xl border text-[12px] whitespace-nowrap bg-[#F1F5F3] ${
                      user.subscription === "Premium"
                        ? "text-[#619B7F] border-[#CFE6FF]"
                        : "text-[#70706C] border-[#D1CEC6]"
                    }`}>
                    {user.subscription}
                  </span>
                </td>

                {/* Properties */}
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.propertiesOwn}
                </td>
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.propertiesBuy}
                </td>
                <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                  {user.propertiesSell}
                </td>

                {/* Action */}
                <td className='px-4 py-3 border border-[#E8E5DD]'>
                  <button
                    onClick={() => router.push(`/users/${user.id}`)}
                    className='text-sm text-[#1B1B1A] underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap'>
                    View User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination – now uses real total */}
      <div className='px-4 py-4'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalUsers}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
