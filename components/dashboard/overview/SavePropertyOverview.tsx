import { BathIcon, Bed, MapPin, Square } from "lucide-react";
import Image from "next/image";

export const SavePropertyOverview = () => {
  return (
    <div className='p-4 bg-white rounded-md shadow-md border-2 border-[#D1CEC6]'>
      <div className='flex justify-between border-b border-[#D1CEC6] mb-3'>
        <h1 className='text-[24px]'>Save Property</h1>
        <button className='text-[#0284C7] text-[24px] mb-2 cursor-pointer'>
          View All
        </button>
      </div>
      <div className='flex flex-col space-y-4'>
        {/* Property Card 1 */}
        <div className='flex flex-col lg:flex-row md:items-center lg:space-x-4 border border-[#D1CEC6] p-3 rounded-lg'>
          <div className=''>
            <Image
              src='/property.png'
              alt='Property'
              width={150}
              height={150}
              className='object-cover w-62.5 md:w-37.5 h-auto rounded-md'
            />
          </div>
          <div className='flex-1 mt-2 md:mt-0'>
            <h3 className='text-lg font-semibold'>Modern Luxury Villa</h3>
            <div className='flex gap-0.5'>
              <MapPin size={20} />
              <p className='text-sm text-gray-500'>
                2715 Ash Dr. San Jose, 83475
              </p>
            </div>
            <div className='flex space-x-4 text-sm text-gray-600 mt-1'>
              <div className='flex gap-0.5'>
                <Bed size={20} />
                <p>5 Beds</p>
              </div>
              <div className='flex gap-0.5'>
                <BathIcon size={20} />
                <p>3 Baths</p>
              </div>
              <div className='flex gap-0.5'>
                <Square size={20} />
                <p>2000 Sqft</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col mt-5 md:mt-0'>
            <span className='text-xl font-bold text-gray-900'>$1,649.99</span>
            <button className='mt-2 w-25 md:w-full underline cursor-pointer'>
              View Details
            </button>
          </div>
        </div>

        {/* Property Card 2 */}
        <div className='flex flex-col lg:flex-row md:items-center lg:space-x-4 border border-[#D1CEC6] p-3 rounded-lg'>
          <Image
            src='/property.png'
            alt='Property'
            width={150}
            height={150}
            className='object-cover w-62.5 md:w-37.5 h-auto rounded-md'
          />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>Modern Luxury Villa</h3>
            <div className='flex gap-0.5'>
              <MapPin size={20} />
              <p className='text-sm text-gray-500'>
                2715 Ash Dr. San Jose, 83475
              </p>
            </div>
            <div className='flex space-x-4 text-sm text-gray-600 mt-1'>
              <div className='flex gap-0.5'>
                <Bed size={20} />
                <p>5 Beds</p>
              </div>
              <div className='flex gap-0.5'>
                <BathIcon size={20} />
                <p>3 Baths</p>
              </div>
              <div className='flex gap-0.5'>
                <Square size={20} />
                <p>2000 Sqft</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col mt-5 md:mt-0'>
            <span className='text-xl font-bold text-gray-900'>$1,649.99</span>
            <button className='mt-2 underline cursor-pointer w-25 md:w-full'>
              View Details
            </button>
          </div>
        </div>

        {/* Property Card 3 */}
        <div className='flex flex-col lg:flex-row items-center lg:space-x-4 border border-[#D1CEC6] p-3 rounded-lg'>
          <Image
            src='/property.png'
            alt='Property'
            width={150}
            height={150}
            className='object-cover w-62.5 md:w-37.5 h-auto rounded-md'
          />
          <div className='flex-1 mt-2 md:mt-0'>
            <h3 className='text-lg font-semibold'>Modern Luxury Villa</h3>
            <div className='flex gap-0.5'>
              <MapPin size={20} />
              <p className='text-sm text-gray-500'>
                2715 Ash Dr. San Jose, 83475
              </p>
            </div>
            <div className='flex space-x-4 text-sm text-gray-600 mt-1'>
              <div className='flex gap-0.5'>
                <Bed size={20} />
                <p>5 Beds</p>
              </div>
              <div className='flex gap-0.5'>
                <BathIcon size={20} />
                <p>3 Baths</p>
              </div>
              <div className='flex gap-0.5'>
                <Square size={20} />
                <p>2000 Sqft</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col mt-5 md:mt-0'>
            <span className='text-xl font-bold text-gray-900'>$1,649.99</span>
            <button className='mt-2 underline cursor-pointer'>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
