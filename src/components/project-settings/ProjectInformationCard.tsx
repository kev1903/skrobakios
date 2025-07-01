
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      // Using OpenStreetMap Nominatim API for geocoding (free alternative)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        
        // Update the formatted address and coordinates
        onInputChange("location", result.display_name);
        onInputChange("coordinates", coordinates);
        
        toast({
          title: "Address Validated",
          description: "Address has been successfully validated and location coordinates have been saved.",
        });
      } else {
        toast({
          title: "Address Not Found",
          description: "Could not find the specified address. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Address validation error:', error);
      toast({
        title: "Validation Error",
        description: "Unable to validate address. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };

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
