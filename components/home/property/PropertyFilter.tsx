"use client";

import Location from "@/components/home/property/Location";
import { ChevronDownIcon, ChevronUpIcon, MapPinned, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

export interface PropertyFilters {
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  locationText: string;
  locationCoords?: { lat: number; lng: number };
  squareFeet: number[];
  bedrooms: number[];
  bathrooms: number[];
}

interface PropertyFilterProps {
  value: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
  onClear?: () => void;
}

const DEFAULT_MAX_PRICE = 10000000;

export default function PropertyFilter({ value, onChange, onClear }: PropertyFilterProps) {
  const [showPropertyType, setShowPropertyType] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showSquareFeet, setShowSquareFeet] = useState(true);
  const [showBedrooms, setShowBedrooms] = useState(true);
  const [showBathrooms, setShowBathrooms] = useState(true);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const update = (patch: Partial<PropertyFilters>) => {
    onChange({ ...value, ...patch });
  };

  const toggleNumberFilter = (key: "squareFeet" | "bedrooms" | "bathrooms", item: number) => {
    const source = value[key];
    const next = source.includes(item)
      ? source.filter((n) => n !== item)
      : [...source, item];
    update({ [key]: next } as Pick<PropertyFilters, typeof key>);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange({
      minPrice: 0,
      maxPrice: DEFAULT_MAX_PRICE,
      propertyType: "All Property",
      locationText: "",
      squareFeet: [],
      bedrooms: [],
      bathrooms: [],
    });
  };

  return (
    <div className='w-full'>
      <div className='lg:hidden flex justify-between mb-4'>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='text-[#619B7F] p-2 rounded-md'>
          {sidebarOpen ? <XIcon className='h-6 w-6' /> : <MenuIcon className='h-6 w-6' />}
        </button>
      </div>

      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full md:w-[320px] p-6 border border-gray-300 rounded-lg`}>
        <div className='flex justify-between mb-4'>
          <h2 className='text-xl font-semibold'>Filters</h2>
          <button className='text-red-500 cursor-pointer' onClick={handleClear}>
            Clear
          </button>
        </div>

        <div className='mb-4'>
          <label className='block font-semibold text-lg border-b-2 border-gray-300 mb-5 pb-2'>
            Price Range
          </label>
          <div className='flex justify-between items-center mt-2 text-sm text-gray-500'>
            <span>${value.minPrice.toLocaleString()}</span>
            <span>${value.maxPrice.toLocaleString()}</span>
          </div>
          <div className='mt-3 space-y-2'>
            <input
              type='range'
              min={0}
              max={DEFAULT_MAX_PRICE}
              step={1000}
              value={value.maxPrice}
              onChange={(e) =>
                update({
                  maxPrice: Math.max(Number(e.target.value), value.minPrice),
                })
              }
              className='w-full accent-[#619B7F]'
            />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              min={0}
              value={value.minPrice}
              onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
              className='border border-gray-300 rounded-md p-2'
              placeholder='Min'
            />
            <input
              type='number'
              min={0}
              value={value.maxPrice}
              onChange={(e) => update({ maxPrice: Number(e.target.value) || DEFAULT_MAX_PRICE })}
              className='border border-gray-300 rounded-md p-2'
              placeholder='Max'
            />
          </div>
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Property Type</label>
            <button onClick={() => setShowPropertyType(!showPropertyType)} className='text-blue-500 flex items-center'>
              {showPropertyType ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showPropertyType && (
            <div className='flex flex-col mt-2'>
              {["All Property", "Apartment", "Duplex", "Luxury Property", "Land"].map((type) => (
                <label key={type} className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='propertyType'
                    value={type}
                    checked={value.propertyType === type}
                    onChange={() => update({ propertyType: type })}
                    className='border-gray-300'
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Location</label>
            <button onClick={() => setShowLocation(!showLocation)} className='text-blue-500 flex items-center'>
              {showLocation ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showLocation && (
            <div className='mt-3 space-y-3'>
              <input
                type='text'
                value={value.locationText}
                onChange={(e) => update({ locationText: e.target.value })}
                placeholder='Search by address/area...'
                className='w-full border border-gray-300 rounded-md p-2'
              />
              <button
                onClick={() => setShowMapSearch((prev) => !prev)}
                className='w-full border border-[#619B7F] text-[#619B7F] p-2 rounded-md flex items-center justify-center gap-2'>
                <MapPinned className='h-4 w-4' />
                {showMapSearch ? "Hide Map Search" : "Open Map Search"}
              </button>
              {showMapSearch && (
                <div className='rounded-md border border-gray-200 p-2'>
                  <Location
                    address={value.locationText || undefined}
                    onLocationSelect={(location) =>
                      update({
                        locationText: location.address,
                        locationCoords: { lat: location.lat, lng: location.lng },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Square Feet</label>
            <button onClick={() => setShowSquareFeet(!showSquareFeet)} className='text-blue-500 flex items-center'>
              {showSquareFeet ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showSquareFeet && (
            <div className='flex flex-col mt-2'>
              {[3000, 2400, 2000, 1800, 1500, 1200].map((size) => (
                <label key={size} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='checkbox'
                    checked={value.squareFeet.includes(size)}
                    onChange={() => toggleNumberFilter("squareFeet", size)}
                    className='border-gray-300'
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Bedrooms</label>
            <button onClick={() => setShowBedrooms(!showBedrooms)} className='text-blue-500 flex items-center'>
              {showBedrooms ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showBedrooms && (
            <div className='flex flex-col mt-2'>
              {[6, 5, 4, 3, 2, 1].map((bed) => (
                <label key={bed} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='checkbox'
                    checked={value.bedrooms.includes(bed)}
                    onChange={() => toggleNumberFilter("bedrooms", bed)}
                    className='border-gray-300'
                  />
                  <span>{bed}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className='mb-2'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Bathrooms</label>
            <button onClick={() => setShowBathrooms(!showBathrooms)} className='text-blue-500 flex items-center'>
              {showBathrooms ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showBathrooms && (
            <div className='flex flex-col mt-2'>
              {[6, 5, 4, 3, 2, 1].map((bath) => (
                <label key={bath} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='checkbox'
                    checked={value.bathrooms.includes(bath)}
                    onChange={() => toggleNumberFilter("bathrooms", bath)}
                    className='border-gray-300'
                  />
                  <span>{bath}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
