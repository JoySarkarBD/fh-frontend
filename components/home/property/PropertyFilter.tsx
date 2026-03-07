"use client";

import {
  ArrowRight,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  MenuIcon,
  Search,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [squareFeetSearch, setSquareFeetSearch] = useState("");
  const [locationInput, setLocationInput] = useState(value.locationText || "");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const baseSquareFeetOptions = [3000, 2400, 2000, 1800, 1500, 1200];
  const mergedSquareFeetOptions = Array.from(
    new Set([...baseSquareFeetOptions, ...value.squareFeet])
  ).sort((a, b) => b - a);

  const normalizedSquareFeetSearch = squareFeetSearch.replace(/\D/g, "");
  const filteredSquareFeetOptions = normalizedSquareFeetSearch
    ? mergedSquareFeetOptions.filter((size) =>
        String(size).includes(normalizedSquareFeetSearch)
      )
    : mergedSquareFeetOptions;
  const searchedSquareFeetValue = normalizedSquareFeetSearch
    ? Number(normalizedSquareFeetSearch)
    : null;

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

  useEffect(() => {
    const query = locationInput.trim();
    if (!query) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLocationLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
        );
        const data = (await response.json()) as Array<{ display_name?: string }>;
        const suggestions = data
          .map((item) => item.display_name?.trim())
          .filter((item): item is string => !!item);
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(suggestions.length > 0);
      } catch {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      } finally {
        setIsLocationLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [locationInput]);

  useEffect(() => {
    setLocationInput(value.locationText || "");
  }, [value.locationText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyLocationSearch = () => {
    update({ locationText: locationInput.trim() });
    setShowLocationSuggestions(false);
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
            <button onClick={() => setShowPropertyType(!showPropertyType)} className='text-black flex items-center'>
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
            <button onClick={() => setShowLocation(!showLocation)} className='text-black flex items-center'>
              {showLocation ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showLocation && (
            <div className='mt-3 space-y-3'>
              <div className='relative' ref={locationRef}>
                <Search className='h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
                <input
                  type='text'
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyLocationSearch();
                    }
                  }}
                  placeholder='Search by address/area...'
                  className='w-full border border-gray-300 rounded-md p-2 pl-9 pr-20'
                />
                {locationInput && (
                  <button
                    type='button'
                    onClick={() => {
                      setLocationInput("");
                      update({ locationText: "" });
                      setShowLocationSuggestions(false);
                    }}
                    className='absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                    <XIcon className='h-4 w-4' />
                  </button>
                )}
                <button
                  type='button'
                  onClick={applyLocationSearch}
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-[#619B7F] hover:text-[#4a7b63]'>
                  <ArrowRight className='h-4 w-4' />
                </button>
              </div>
              {isLocationLoading && (
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Searching...
                </div>
              )}
              {!isLocationLoading &&
                showLocationSuggestions &&
                locationSuggestions.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type='button'
                      onClick={() => {
                        setLocationInput(suggestion);
                        update({ locationText: suggestion });
                        setShowLocationSuggestions(false);
                      }}
                      className='text-xs px-2 py-1 rounded-full border border-[#D1CEC6] hover:border-[#619B7F] hover:text-[#619B7F] text-left'>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Square Feet</label>
            <button onClick={() => setShowSquareFeet(!showSquareFeet)} className='text-black flex items-center'>
              {showSquareFeet ? <ChevronUpIcon className='h-5 w-5' /> : <ChevronDownIcon className='h-5 w-5' />}
            </button>
          </div>
          {showSquareFeet && (
            <div className='flex flex-col mt-2'>
              <input
                type='text'
                value={squareFeetSearch}
                onChange={(e) =>
                  setSquareFeetSearch(e.target.value.replace(/\D/g, ""))
                }
                inputMode='numeric'
                placeholder='Search sqft (numbers only)'
                className='w-full border border-gray-300 rounded-md p-2 mb-3'
              />
              {searchedSquareFeetValue &&
                searchedSquareFeetValue > 0 &&
                !mergedSquareFeetOptions.includes(searchedSquareFeetValue) && (
                  <button
                    type='button'
                    onClick={() =>
                      toggleNumberFilter("squareFeet", searchedSquareFeetValue)
                    }
                    className='text-left text-sm mb-2 text-[#619B7F] hover:underline'>
                    Add {searchedSquareFeetValue} sqft
                  </button>
                )}
              {filteredSquareFeetOptions.map((size) => (
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
              {filteredSquareFeetOptions.length === 0 && (
                <p className='text-sm text-gray-500'>No square-feet option found</p>
              )}
            </div>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-2'>
            <label className='block font-semibold text-lg'>Bedrooms</label>
            <button onClick={() => setShowBedrooms(!showBedrooms)} className='text-black flex items-center'>
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
            <button onClick={() => setShowBathrooms(!showBathrooms)} className='text-black flex items-center'>
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
