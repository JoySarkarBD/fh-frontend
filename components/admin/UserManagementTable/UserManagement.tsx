"use client";

import { useEffect, useState } from "react";
import UserDetailsModal from "./UserDetailsModal";
import Image from "next/image";
import { useGetAllUsersAdmin } from "@/actions/hooks/user.hooks";
import Pagination from "@/components/pagination/Pagination";
import { Loader2, Search } from "lucide-react";

const PER_PAGE = 9;

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalUserId, setModalUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = searchInput.trim();
      setSearchTerm(normalized);
      setCurrentPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data with current page + search
  const { data, isLoading, isFetching, isError, error } = useGetAllUsersAdmin(
    currentPage,
    PER_PAGE,
    searchTerm,
  );

  const rawUsers = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalUsers = pagination?.total ?? 0;

  // Hide ADMIN users
  const filteredUsers = rawUsers.filter(
    (user) => String(user.role || "").toUpperCase() !== "ADMIN",
  );

  // Initial loading only (keep layout mounted during subsequent fetches)
  if (isLoading && !data) {
    return (
      <div className='flex flex-col items-center justify-center min-h-100 gap-4'>
        <Loader2 className='h-10 w-10 animate-spin text-gray-500' />
        <p className='text-gray-600'>Loading users...</p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className='p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200'>
        <p className='font-medium'>Failed to load users</p>
        <p className='text-sm mt-2'>
          {error?.message || "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  // Table rows
  type TableRow = {
    id: string;
    image: string;
    profileName: string;
    email: string;
    phone: string;
    address: string;
    subscription: boolean;
    propertiesOwn: number;
    propertiesBuy: number;
    propertiesSell: number;
  };

  const tableRows: TableRow[] = filteredUsers.map((user) => ({
    id: user._id ? String(user._id) : "",
    image: "/user.png",
    profileName: user.name || "Unknown",
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    address: user.homeAddress || user.officeAddress || "N/A",
    subscription: user.isSubscribed ?? false,
    propertiesOwn:
      typeof user.propertyOwnCount === "number" ? user.propertyOwnCount : 0,
    propertiesBuy:
      typeof user.propertyBuyCount === "number" ? user.propertyBuyCount : 0,
    propertiesSell:
      typeof user.propertySellCount === "number" ? user.propertySellCount : 0,
  }));

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6] overflow-hidden'>
      {/* Header + Search */}
      <div className='px-6 py-5 border-b border-[#D1CEC6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-xl md:text-2xl font-semibold text-gray-800'>
          User Management
        </h1>

        {/* Simple Tailwind search input */}
        <div className='relative w-full sm:w-72'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
          <input
            type='text'
            placeholder='Search by name or email...'
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className='
              w-full pl-10 pr-4 py-2.5
              border border-[#D1CEC6] rounded-lg
              text-sm text-gray-700 placeholder-gray-400
              focus:outline-none focus:border-[#619B7F] focus:ring-2 focus:ring-[#619B7F]/20
              transition-all duration-200
            '
          />
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-[15px] text-left'>
          <thead className='bg-gray-50 border-b border-[#D1CEC6]'>
            <tr>
              <th className='px-6 py-4 text-left font-medium text-gray-600 w-28'>
                Profile
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                User Name
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Email Address
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Phone
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Address
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Subscription
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Properties Own
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Properties Buy
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Properties Sell
              </th>
              <th className='px-6 py-4 text-left font-medium text-gray-600'>
                Action
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-[#E8E5DD]'>
            {tableRows.length > 0 ? (
              tableRows.map((user) => (
                <tr
                  key={user.id}
                  className='hover:bg-gray-50 transition-colors duration-150'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200'>
                      <Image
                        loading='eager'
                        src={user.image}
                        alt={user.profileName}
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </td>

                  <td className='px-6 py-4 font-medium text-gray-800'>
                    {user.profileName}
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{user.email}</td>
                  <td className='px-6 py-4 text-gray-600'>{user.phone}</td>
                  <td className='px-6 py-4 text-gray-600'>{user.address}</td>

                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs  ${
                        user.subscription
                          ? "bg-green-50 text-[#619B7F]"
                          : "bg-gray-100 text-black"
                      }`}>
                      {user.subscription ? "Premium" : "Free"}
                    </span>
                  </td>

                  <td className='px-6 py-4 text-center text-gray-600'>
                    {user.propertiesOwn}
                  </td>
                  <td className='px-6 py-4 text-center text-gray-600'>
                    {user.propertiesBuy}
                  </td>
                  <td className='px-6 py-4 text-center text-gray-600'>
                    {user.propertiesSell}
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <button
                      onClick={() =>
                        setModalUserId(user.id ? String(user.id) : "")
                      }
                      className='text-sm text-[#1B1B1A] underline underline-offset-2 transition-colors cursor-pointer hover:text-[#619B7F]'>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className='px-6 py-10 text-center text-gray-500'>
                  {searchTerm.trim()
                    ? "No users found matching your search."
                    : "No regular users found at the moment."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + info */}
      <div className='px-6 py-4 border-t border-[#D1CEC6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600'>
        <p>
          Showing {filteredUsers.length} of {totalUsers} users
          {searchTerm && ` (filtered by "${searchTerm}")`}
          {isFetching ? " • Updating..." : ""}
        </p>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalUsers}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
      {/* User Details Modal */}
      <UserDetailsModal
        userId={modalUserId || ""}
        open={!!modalUserId}
        onClose={() => setModalUserId(null)}
      />
    </div>
  );
}
