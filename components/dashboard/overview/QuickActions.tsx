import Link from "next/link";
import { FaBoxes, FaHome, FaSearch, FaUpload } from "react-icons/fa";

export const QuickActions = () => {
  return (
    <div className='p-4 bg-white rounded-md h-82 border-2 border-[#D1CEC6] shadow-md'>
      <div className='border-b border-[#D1CEC6] mb-5'>
        <h3 className='text-xl font-semibold mb-4'>Quick Actions</h3>
      </div>
      <div className='grid grid-cols-2 gap-4 '>
        {/* Find Property */}
        <Link href='/properties'>
          <div className='flex items-center justify-center p-4 h-24.75 border border-[#D1CEC6] rounded-md hover:bg-gray-100 cursor-pointer hover:text-[#619B7F]'>
            <div className='flex flex-col justify-center items-center'>
              <FaSearch className='text-2xl' />
              <span className='ml-2'>Find Property</span>
            </div>
          </div>
        </Link>

        {/* Add Property */}
        <Link href='/dashboard/main/add-property'>
          <div className='flex items-center justify-center p-4 h-24.75 border border-[#D1CEC6] rounded-md hover:bg-gray-100 cursor-pointer hover:text-[#619B7F]'>
            <div className='flex flex-col justify-center items-center'>
              <FaHome className='text-2xl' />
              <span className='ml-2 '>Add Property</span>
            </div>
          </div>
        </Link>

        {/* Sell Property Post */}
        <Link href='/dashboard/main/sell-property'>
          <div className='flex items-center justify-center p-4 h-24.75 border border-[#D1CEC6] rounded-md hover:bg-gray-100 cursor-pointer hover:text-[#619B7F]'>
            <div className='flex flex-col justify-center items-center'>
              <FaBoxes className='text-2xl' />
              <span className='ml-2 '>Sell Property Post</span>
            </div>
          </div>
        </Link>

        {/* Upload Document */}
        <Link href='/dashboard/main/documents'>
          <div className='flex items-center justify-center p-4 h-24.75 border border-[#D1CEC6] rounded-md hover:bg-gray-100 cursor-pointer hover:text-[#619B7F]'>
            <div className='flex flex-col justify-center items-center'>
              <FaUpload className='text-2xl' />
              <span className='ml-2'>Upload Document</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
