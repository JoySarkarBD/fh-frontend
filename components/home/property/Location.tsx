// components/home/property/Location.tsx
"use client";

import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LocationProps {
  address?: string;
  lat?: number;
  lng?: number;
  onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void;
}

export default function Location({ 
  address: initialAddress, 
  lat: initialLat, 
  lng: initialLng,
  onLocationSelect 
}: LocationProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(initialAddress && initialLat && initialLng ? {
    address: initialAddress,
    lat: initialLat,
    lng: initialLng
  } : null);
  
  const [mapUrl, setMapUrl] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map when location is selected
  useEffect(() => {
    if (selectedLocation) {
      const { lat, lng } = selectedLocation;
      setMapUrl(`https://www.google.com/maps?q=${lat},${lng}&output=embed`);
      
      // Call the callback if provided
      if (onLocationSelect) {
        onLocationSelect(selectedLocation);
      }
    }
  }, [selectedLocation, onLocationSelect]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching places:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle place selection
  const handleSelectPlace = (place: any) => {
    const location = {
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    };
    
    setSelectedLocation(location);
    setSearchQuery(place.display_name);
    setShowSuggestions(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const location = {
            address: data.display_name,
            lat: latitude,
            lng: longitude
          };
          
          setSelectedLocation(location);
          setSearchQuery(data.display_name);
        } catch (error) {
          console.error("Error getting address:", error);
          // Still set location even if reverse geocoding fails
          setSelectedLocation({
            address: `${latitude}, ${longitude}`,
            lat: latitude,
            lng: longitude
          });
          setSearchQuery(`${latitude}, ${longitude}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please search manually.");
        setLoading(false);
      }
    );
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setMapUrl("");
  };

  return (
    <section className='w-full'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Property Location</h2>
        
        {/* Search Bar */}
        <div ref={searchRef} className='relative'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search for an address, city, or landmark...'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#619B7F] focus:border-transparent'
              />
              {searchQuery && (
                <button
                  onClick={clearSelection}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50'
            >
              {loading ? (
                <Loader2 size={20} className='animate-spin' />
              ) : (
                <Navigation size={20} />
              )}
              <span className='hidden sm:inline'>Current Location</span>
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
              {suggestions.map((place, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectPlace(place)}
                  className='w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0'
                >
                  <MapPin size={18} className='text-gray-400 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-gray-900'>
                      {place.display_name.split(',')[0]}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {place.display_name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className='mt-4 p-4 bg-[#619B7F]/10 border border-[#619B7F]/20 rounded-lg'>
            <div className='flex items-start gap-3'>
              <MapPin className='text-[#619B7F] mt-0.5' size={20} />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>Selected Location</p>
                <p className='text-sm text-gray-600 mt-1'>{selectedLocation.address}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <button
                onClick={clearSelection}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      {mapUrl ? (
        <div className='overflow-hidden border border-gray-200 rounded-lg shadow-sm'>
          <div className='relative w-full h-96'>
            <iframe
              title='property-location'
              src={mapUrl}
              className='w-full h-full block'
              loading='lazy'
              allowFullScreen
            />

            {/* Custom Pin */}
            <div className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              {/* <div className='relative'>
                <MapPin 
                  size={48} 
                  className='text-[#619B7F] drop-shadow-lg animate-bounce' 
                  fill='white'
                />
                <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#619B7F] rounded-full' />
              </div> */}
            </div>
          </div>

          {/* Map Footer */}
          <div className='p-4 bg-white'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <MapPin size={16} className='text-[#619B7F]' />
                <span className='truncate max-w-md'>
                  {selectedLocation?.address || "Location"}
                </span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation?.lat},${selectedLocation?.lng}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-sm text-[#619B7F] hover:underline'
              >
                <Navigation size={16} />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50'>
          <MapPin size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-700 mb-2'>No Location Selected</h3>
          <p className='text-sm text-gray-500 mb-4'>
            Search for an address or use your current location to see the map
          </p>
          <div className='flex justify-center gap-3'>
            <button
              onClick={() => searchRef.current?.querySelector('input')?.focus()}
              className='px-4 py-2 bg-[#619B7F] text-white rounded-md hover:bg-[#4a7b63] transition'
            >
              Search Address
            </button>
            <button
              onClick={getCurrentLocation}
              className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition'
            >
              Use Current Location
            </button>
          </div>
        </div>
      )}
    </section>
  );
}