"use client";

import { useAdminDashboardStats } from "@/actions/hooks/user.hooks";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardLeftGraph() {
  const [isMobile, setIsMobile] = useState(false);
  const { data: stats, isLoading } = useAdminDashboardStats();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const barValue = stats?.revenueTrend ?? [];
  const maxRevenue = Math.max(1000, ...barValue.map((row) => row.revenue || 0));

  return (
    <div>
      <p className='text-xl md:text-2xl border-b border-[#D1CEC6] pb-3 mb-4'>
        Revenue Trend
      </p>
      {isLoading ? (
        <div className='w-full h-70 md:h-80 lg:h-186 flex items-center justify-center'>
          <span className='text-[#70706C] text-lg'>Loading revenue trend...</span>
        </div>
      ) : (
      <div className='w-full h-70 md:h-80 lg:h-186 -ml-5 md:ml-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={barValue}
            margin={{
              top: isMobile ? 20 : 30,
              right: isMobile ? 5 : 30,
              left: isMobile ? 5 : 0,
              bottom: isMobile ? 15 : 20,
            }}
            barCategoryGap={isMobile ? "7%" : "10%"}>
            <XAxis
              dataKey='month'
              tick={{ fill: "#70706C", fontSize: isMobile ? 10 : 15 }}
              axisLine={{ stroke: "#FFFFFF" }}
            />
            <YAxis
              tick={{ fill: "#70706C", fontSize: isMobile ? 10 : 15 }}
              axisLine={{ stroke: "#FFFFFF" }}
              domain={[0, Math.ceil(maxRevenue * 1.2)]}
              label={
                isMobile
                  ? undefined
                  : {
                      angle: -90,
                      position: "insideLeft",
                      fill: "#70706C",
                    }
              }
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
                "Monthly Revenue",
              ]}
              labelStyle={{ color: "#304C3E", fontWeight: "bold" }}
              itemStyle={{ color: "#619B7F", fontWeight: "500" }}
              wrapperStyle={{ color: "#619B7F" }}
              cursor={{ fill: "rgba(209, 227, 217, 0)" }}
            />
            <Bar
              dataKey='revenue'
              fill='#D1E3D9'
              stroke='#D1CEC6'
              strokeWidth={1}
              radius={[7, 7, 0, 0]}
              maxBarSize={isMobile ? 40 : 100}
              activeBar={{ fill: "#619B7F" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
