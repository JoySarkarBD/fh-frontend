"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminDashboardStats } from "@/actions/hooks/user.hooks";
import {
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Sector,
  PieSectorDataItem,
  Cell,
} from "recharts";

export default function DashboardRightGraph() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sellingData = [
    { month: "Jan", sales: 1100 },
    { month: "Feb", sales: 1500 },
    { month: "Mar", sales: 1700 },
    { month: "Apr", sales: 2900 },
    { month: "May", sales: 2400 },
    { month: "Jun", sales: 2700 },
    { month: "Jul", sales: 4100 },
    { month: "Aug", sales: 3800 },
    { month: "Sep", sales: 4300 },
    { month: "Oct", sales: 5200 },
    { month: "Nov", sales: 3900 },
    { month: "Dec", sales: 4100 },
  ];

  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const userDistributionData = useMemo(() => {
    if (!stats) {
      return [
        { name: "Free", value: 0, color: "#D1E3D9" },
        { name: "Premium", value: 0, color: "#619B7F" },
      ];
    }
    const premium = stats.activeSubscribers ?? 0;
    const total = stats.totalUsers ?? 0;
    const free = Math.max(total - premium, 0);
    return [
      { name: "Free", value: free, color: "#D1E3D9" },
      { name: "Premium", value: premium, color: "#619B7F" },
    ];
  }, [stats]);

  const renderActiveShape = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent,
    value,
  }: PieSectorDataItem) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * (midAngle ?? 1));
    const cos = Math.cos(-RADIAN * (midAngle ?? 1));
    const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
    const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
    const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
    const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={(outerRadius ?? 0) + 6}
          outerRadius={(outerRadius ?? 0) + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill='none'
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none' />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill='#333'>{`${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill='#999'>
          {`${((percent ?? 1) * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='border border-[#D1CEC6] rounded-lg p-3 md:p-5 '>
        <p className='text-xl md:text-2xl border-b border-[#D1CEC6] pb-3 mb-4'>
          Selling Overview
        </p>
        <div className='w-full h-60 md:h-80 -ml-3 md:ml-0 bg-white'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={sellingData}
              margin={{
                top: isMobile ? 10 : 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 0,
                bottom: isMobile ? 10 : 0,
              }}>
              <XAxis
                dataKey='month'
                tick={{ fill: "#000000", fontSize: isMobile ? 10 : 15 }}
                axisLine={{ stroke: "#FFFFFF" }}
              />
              <YAxis
                tick={{ fill: "#000000", fontSize: isMobile ? 10 : 15 }}
                axisLine={{ stroke: "#FFFFFF" }}
                domain={[0, 6000]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #D1E3D9",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: unknown) => [
                  `$${typeof value === "number" ? value.toLocaleString() : 0}`,
                  "Monthly Sales",
                ]}
                labelStyle={{ color: "#304C3E", fontWeight: "bold" }}
                itemStyle={{ color: "#619B7F", fontWeight: "500" }}
                wrapperStyle={{ color: "#619B7F" }}
                cursor={{ stroke: "rgba(209, 227, 217, 0.5)" }}
              />
              <Line
                type='monotone'
                dataKey='sales'
                stroke='#619B7F'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='border border-[#D1CEC6] rounded-lg p-3 md:py-5 md:px-6 lg:px-5 '>
        <p className='text-xl md:text-2xl border-b border-[#D1CEC6] pb-3 mb-4'>
          User Distribution
        </p>
        <div className='flex flex-col items-center w-full'>
          {statsLoading ? (
            <div className='w-full h-60 md:h-80 flex items-center justify-center'>
              <span className='text-[#70706C] text-lg'>
                Loading user distribution...
              </span>
            </div>
          ) : (
            <>
              <div className='w-full h-60 md:h-80 -ml-3 md:ml-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart
                    margin={{
                      top: 0,
                      right: isMobile ? 40 : 80,
                      bottom: 0,
                      left: isMobile ? 40 : 80,
                    }}>
                    <Pie
                      activeShape={renderActiveShape}
                      data={userDistributionData}
                      cx='50%'
                      cy='50%'
                      innerRadius='40%'
                      outerRadius='70%'
                      startAngle={90}
                      endAngle={-270}
                      dataKey='value'
                      isAnimationActive={true}>
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={() => null} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-6 justify-center'>
                {userDistributionData.map((item) => (
                  <div
                    key={item.name}
                    className='flex items-center gap-2 -mt-5'>
                    <div
                      className='w-3 h-3 md:w-4 md:h-4 rounded'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-xs md:text-lg font-medium text-[#304C3E]'>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
