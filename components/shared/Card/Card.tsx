"use client";

import { Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

type MetaItem = {
  label: string;
  value?: string | number;
  icon?: React.ElementType;
};

type BaseProps = {
  imageUrl?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  id?: string | number;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  children?: ReactNode; // for custom content
  className?: string;
};

export type PropertyCardProps = BaseProps & {
  type: "property";
  meta?: MetaItem[];
  price?: string | number;
  date?: undefined | string;
  dateIcon?: undefined;
};

export type NewsCardProps = BaseProps & {
  type: "blog";
  date: string;
  dateIcon?: React.ElementType;
  meta?: undefined;
  price?: undefined;
};

type CardProps = PropertyCardProps | NewsCardProps;

const Card: React.FC<CardProps> = (props) => {
  const router = useRouter();
  const {
    id,
    imageUrl,
    badge,
    title,
    subtitle,
    type,
    onPrimaryAction,
    primaryActionLabel = "",
    children,
    className = "",
  } = props;

  const isNews = props.type === "blog";
  const meta = !isNews ? ((props as PropertyCardProps).meta ?? []) : [];
  const price = !isNews ? (props as PropertyCardProps).price : undefined;
  const date = isNews ? (props as NewsCardProps).date : undefined;
  const dateIcon = isNews ? (props as NewsCardProps).dateIcon : undefined;

  // Add this handler function
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction(); // Call custom action if provided
    } else if (id) {
      // Navigate based on type
      if (type === "property") {
        router.push(`/properties/${id}`);
      } else if (type === "blog") {
        router.push(`/blog/${id}`);
      }
    }
  };
  return (
    <div
      className={`rounded-lg overflow-hidden border border-[#D1CEC6] hover:border-[#8F8A7E] hover:shadow-lg hover:bg-[#F8FAF9]  transition-colors duration-400 bg-white flex flex-col h-full ${className}`}>
      {imageUrl && (
        <div className='relative h-64 w-full'>
          <Image
            src={imageUrl}
            alt={title ?? ""}
            fill
            className='object-cover'
          />
          {badge && (
            <div className='absolute top-4 left-4 bg-white px-3 py-1 rounded text-sm font-medium text-gray-700'>
              {badge}
            </div>
          )}
        </div>
      )}

      <div className='p-6 text-(--primary-text-color) text-start flex flex-1 flex-col justify-between'>
        {title && (
          <h2
            className={
              type === "blog"
                ? "text-2xl font-medium mb-2"
                : "text-2xl font-bold mb-2"
            }>
            {title}
          </h2>
        )}
        {subtitle && (
          <div
            className={
              type === "blog"
                ? "text-gray-500 mb-4 line-clamp-1"
                : "text-[12px] mb-4"
            }>
            {subtitle}
          </div>
        )}

        {meta.length > 0 && (
          <div className='flex items-center gap-6 text-[#70706C] mb-6'>
            {meta.map((m, idx) => (
              <div key={idx} className='flex items-center'>
                {m.icon && <m.icon className='w-5 h-5 mr-2' />}
                <span className='text-[12px]'>
                  {m.value ? `${m.value} ${m.label}` : m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {children}

        {(price !== undefined ||
          date ||
          onPrimaryAction ||
          (type === "blog" && id && primaryActionLabel)) && (
          <div className='flex items-center justify-between mt-4'>
            <div className='text-[16px] font-bold'>
              {price !== undefined
                ? typeof price === "number"
                  ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : price
                : null}
              {date && (
                <div className='flex items-center font-normal text-sm  mt-1'>
                  {(() => {
                    const DateIcon = dateIcon ?? Calendar;
                    return DateIcon ? (
                      <DateIcon className='w-4 h-4 mr-2' />
                    ) : null;
                  })()}
                  <span>{date}</span>
                </div>
              )}
            </div>

            {(onPrimaryAction || id) && (
              <button
                onClick={handlePrimaryAction}
                className='text-sm underline cursor-pointer'>
                {primaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
