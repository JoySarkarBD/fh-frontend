"use client";
import { FiHome } from "react-icons/fi";
import { useGetUser } from "@/actions/hooks/user.hooks";

type UserStatsLike = Record<string, unknown>;

const toCount = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getCountFromKeys = (user: UserStatsLike | undefined, keys: string[]) => {
  if (!user) return 0;

  for (const key of keys) {
    if (key in user) {
      return toCount(user[key]);
    }
  }

  return 0;
};

export const PropertyCards = () => {
  const { data } = useGetUser();
  const user = data?.data?.data as UserStatsLike | undefined;

  const ownCount = getCountFromKeys(user, [
    "propertyOwn",
    "propertyOwnCount",
    "propertiesOwn",
  ]);
  const buyCount = getCountFromKeys(user, [
    "propertyBuy",
    "propertyBuyCount",
    "propertiesBuy",
  ]);
  const sellCount = getCountFromKeys(user, [
    "propertySell",
    "propertySellCount",
    "propertiesSell",
  ]);
  const rentCount = getCountFromKeys(user, ["propertyRent", "propertiesRent"]);
  const savedCount = getCountFromKeys(user, [
    "savedProperty",
    "savedProperties",
  ]);
  const sellingPostCount = getCountFromKeys(user, [
    "sellingPost",
    "sellingPosts",
  ]);

  return (
    <div>
      {/* Main Div */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        {/* Individual Property Cards */}
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{ownCount}</p>
          </div>
          <p className='text-[20px]'>Own Property</p>
        </div>
        {/* Individual Property Cards */}
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{buyCount}</p>
          </div>
          <p className='text-[20px]'>Property Buy</p>
        </div>
        {/* Individual Property Cards */}
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{sellCount}</p>
          </div>
          <p className='text-[20px]'>Property Sale</p>
        </div>
        {/* Individual Property Cards */}
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{rentCount}</p>
          </div>
          <p className='text-[20px]'>Property Rent</p>
        </div>
        {/* Individual Property Cards */}
        <div className='border-2 border-[#D1CEC6] rounded-sm p-4 h-37.5'>
          <div className='flex justify-between mb-2'>
            <div className='bg-[#A3C7B3] p-2 rounded-lg w-10 h-10'>
              <FiHome className='text-[#304C3E]' size={24} />
            </div>
            <p className='text-[36px]'>{savedCount}</p>
          </div>
          <p className='text-[20px]'>Saved Property</p>
        </div>
        {/* Individual Property Cards */}
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
