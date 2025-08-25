import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface ProjectInformationCardProps {
  formData: {
    name: string;
    description: string;
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  onInputChange: (field: string, value: string | { lat: number; lng: number }) => void;
}

export const ProjectInformationCard = ({ formData, onInputChange }: ProjectInformationCardProps) => {
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) setMapboxToken(data.token);
      } catch (e) {
        console.warn('Mapbox token not available, falling back to OSM');
      }
    };
    getToken();
  }, []);

  const geocodeWithMapbox = async (query: string) => {
    if (!mapboxToken) return null;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=AU&limit=5&autocomplete=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.features as Array<{ place_name: string; center: [number, number] }>;
  };

  const validateAddress = async () => {
    if (!formData.location.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to validate.",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingAddress(true);

    try {
      // Prefer Mapbox if configured, fallback to OSM
      let coords: { lat: number; lng: number } | null = null;
      let formatted = '';

      if (mapboxToken) {
        const feats = await geocodeWithMapbox(formData.location);
        if (feats && feats.length) {
          const f = feats[0];
          coords = { lat: f.center[1], lng: f.center[0] };
          formatted = f.place_name;
        }
      }

      if (!coords) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`);
        if (!response.ok) throw new Error('Geocoding service unavailable');
        const data = await response.json();
        if (data.length > 0) {
          coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          formatted = data[0].display_name;
        }
      }

      if (coords) {
        onInputChange("location", formatted || formData.location);
        onInputChange("coordinates", coords);
        toast({ title: "Address Validated", description: "Coordinates saved for this project." });
      } else {
        toast({ title: "Address Not Found", description: "Could not find the specified address. Please check and try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Address validation error:', error);
      toast({ title: "Validation Error", description: "Unable to validate address. Please try again later.", variant: "destructive" });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Simple autocomplete suggestions
  useEffect(() => {
    const q = formData.location.trim();
    const controller = new AbortController();
    if (mapboxToken && q.length >= 3) {
      geocodeWithMapbox(q).then((feats) => {
        if (!feats) return;
        setSuggestions(feats.map(f => ({ label: f.place_name, lat: f.center[1], lng: f.center[0] })));
      }).catch(() => {});
    } else {
      setSuggestions([]);
    }
    return () => controller.abort();
  }, [formData.location, mapboxToken]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Project Information
        </CardTitle>
        <CardDescription>
          Basic information about your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <Label htmlFor="location">Project Address</Label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => onInputChange("location", e.target.value)}
                  placeholder="Enter full project address (e.g., 123 Main St, City, State, ZIP)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={validateAddress}
                  disabled={isValidatingAddress}
                  className="shrink-0"
                >
                  <Search className="w-4 h-4" />
                  {isValidatingAddress ? "Validating..." : "Validate"}
                </Button>
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                  {suggestions.slice(0,5).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onInputChange("location", s.label);
                        onInputChange("coordinates", { lat: s.lat, lng: s.lng });
                        setSuggestions([]);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-accent"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.coordinates && (
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Enter project description"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
