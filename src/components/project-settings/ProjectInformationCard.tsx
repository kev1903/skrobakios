
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";

interface ProjectInformationCardProps {
  formData: {
    name: string;
    description: string;
    location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ProjectInformationCard = ({ formData, onInputChange }: ProjectInformationCardProps) => {
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onInputChange("location", e.target.value)}
              placeholder="Enter project location"
            />
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
