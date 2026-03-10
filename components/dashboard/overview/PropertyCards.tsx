"use client";

import { useSavedPropertyOverview } from "@/actions/hooks/property.hooks";
import { FiHome } from "react-icons/fi";

export const PropertyCards = () => {
  const { data, isLoading } = useSavedPropertyOverview();
  const stats = data?.data?.stats;

  const ownCount = stats?.ownCount ?? 0;
  const buyCount = stats?.buyCount ?? 0;
  const sellCount = stats?.sellCount ?? 0;
  const rentCount = stats?.rentCount ?? 0;
  const savedCount = stats?.savedCount ?? 0;
  const sellingPostCount = stats?.sellingPostCount ?? 0;

  if (isLoading && !stats) {
    return <div className='p-4'>Loading overview...</div>;
  }

  return (
    <div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{ownCount}</p>
          </div>
          <p className='text-[20px]'>Own Property</p>
        </div>

        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{buyCount}</p>
          </div>
          <p className='text-[20px]'>Property Buy</p>
        </div>

        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{sellCount}</p>
          </div>
          <p className='text-[20px]'>Property Sale</p>
        </div>

        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{rentCount}</p>
          </div>
          <p className='text-[20px]'>Property Rent</p>
        </div>

        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{savedCount}</p>
          </div>
          <p className='text-[20px]'>Saved Property</p>
        </div>

        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{sellingPostCount}</p>
          </div>
          <p className='text-[20px]'>Selling Post</p>
        </div>
      </div>
    </div>
  );
};
