import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationInputProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const LocationInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter project address...",
  label = "Location",
  required = false
}: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1IjoidGlubHlkZXNpZ24iLCJhIjoiY20xcTd1aTJxMDQ4YjJrb21pZDNydDE1eSJ9.L3OLHaUxvKyJ9W7WfFfwzw&types=address,poi&limit=5`);
      
      if (!response.ok) {
        console.error('Mapbox geocoding error:', response.status);
        return;
      }

      const data = await response.json();
      const locationSuggestions = data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center
      }));

      setSuggestions(locationSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValidated(false);
    setSelectedCoordinates(null);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const coordinates = { lat: suggestion.center[1], lng: suggestion.center[0] };
    onChange(suggestion.place_name, coordinates);
    setSelectedCoordinates(coordinates);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidated(false);
    console.log('Selected location:', suggestion.place_name, coordinates);
  };

  const handleValidate = async () => {
    if (!value || isValidated) return;

    setIsValidating(true);
    try {
      // If we don't have coordinates yet, geocode the current value
      if (!selectedCoordinates) {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=pk.eyJ1IjoidGlubHlkZXNpZ24iLCJhIjoiY20xcTd1aTJxMDQ4YjJrb21pZDNydDE1eSJ9.L3OLHaUxvKyJ9W7WfFfwzw&types=address,poi&limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const coordinates = { lat: feature.center[1], lng: feature.center[0] };
            setSelectedCoordinates(coordinates);
            onChange(feature.place_name, coordinates);
            console.log('Validated and updated location:', feature.place_name, coordinates);
          }
        }
      }
      
      setIsValidated(true);
    } catch (error) {
      console.error('Error validating address:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSelectedCoordinates(null);
    setIsValidated(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="location" className="text-sm font-medium text-foreground heading-modern">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            id="location"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 pr-24"
            required={required}
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {value && !isValidated && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleValidate}
                disabled={isValidating}
                className="h-6 px-2"
              >
                {isValidating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {isValidated && (
              <div className="h-6 px-2 flex items-center">
                <Check className="h-3 w-3 text-green-500" />
              </div>
            )}
            
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{suggestion.place_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedCoordinates && isValidated && (
        <p className="text-xs text-muted-foreground">
          Coordinates: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
};