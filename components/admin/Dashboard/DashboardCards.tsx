"use client";

import MiniCard from "@/components/shared/MiniCard/MiniCard";
import { useAdminDashboardStats } from "@/actions/hooks/user.hooks";
import { GiSandsOfTime } from "react-icons/gi";
import {
  LuBadgePercent,
  LuCircleDollarSign,
  LuUser,
  LuUsers,
} from "react-icons/lu";
import { TbUserStar } from "react-icons/tb";

export default function DashboardCards() {
  const { data } = useAdminDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardsData = [
    {
      icon: LuUsers,
      title: String(data?.totalUsers ?? 0),
      subTitle: "Total Users",
    },
    {
      icon: LuUser,
      title: String(data?.thisMonthUsers ?? 0),
      subTitle: "This Month User",
    },
    {
      icon: TbUserStar,
      title: String(data?.activeSubscribers ?? 0),
      subTitle: "Active Subscribers",
    },
    {
      icon: LuCircleDollarSign,
      title: formatCurrency(data?.totalRevenue ?? 0),
      subTitle: "Total Revenue",
    },
    {
      icon: GiSandsOfTime,
      title: String(data?.pendingCommunication ?? 0),
      subTitle: "Pending Communication",
    },
    {
      icon: LuBadgePercent,
      title: `${(data?.conversionRate ?? 0).toFixed(1)}%`,
      subTitle: "Conversion Rate",
    },
  ];
  return (
    <div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 '>
        {cardsData.map((card, index) => (
          <MiniCard
            key={index}
            icon={<card.icon />}
            iconBgClass={
              "w-12 h-12 md:w-14 md:h-14 bg-[#D1E3D9] rounded-lg text-center"
            }
            iconClass={
              "w-8 h-8 md:w-10 md:h-10 text-2xl text-(--primary) !font-light flex items-center justify-center"
            }
            title={card.title}
            titleClass={
              "text-(--primary-text-color) text-[18px] md:text-[24px] !font-normal tracking-tight jost-600 -mt-2"
            }
            description={card.subTitle}
            subtitleClass={"-mt-1 text-[13px] text-[#70706C] "}
          />
        ))}
      </div>
    </div>
  );
}
