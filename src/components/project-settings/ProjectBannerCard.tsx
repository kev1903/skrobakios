
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Image, Upload, X, Move, RotateCcw } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProjectBannerCardProps {
  formData: {
    banner_image: string;
    banner_position?: { x: number; y: number; scale: number };
  };
  onInputChange: (field: string, value: string | { x: number; y: number; scale: number }) => void;
}

export const ProjectBannerCard = ({ formData, onInputChange }: ProjectBannerCardProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const position = formData.banner_position || { x: 0, y: 0, scale: 1 };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG/JPEG image file only",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onInputChange("banner_image", e.target.result as string);
        onInputChange("banner_position", { x: 0, y: 0, scale: 1 });
        toast({
          title: "Banner Uploaded",
          description: "Project banner has been updated successfully.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!formData.banner_image) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [formData.banner_image, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const newX = Math.max(-200, Math.min(200, e.clientX - dragStart.x));
    const newY = Math.max(-100, Math.min(100, e.clientY - dragStart.y));
    
    onInputChange("banner_position", { ...position, x: newX, y: newY });
  }, [isDragging, dragStart, position, onInputChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleScaleChange = (value: number[]) => {
    onInputChange("banner_position", { ...position, scale: value[0] });
  };

  const resetPosition = () => {
    onInputChange("banner_position", { x: 0, y: 0, scale: 1 });
  };

  const removeBanner = () => {
    onInputChange("banner_image", "");
    onInputChange("banner_position", { x: 0, y: 0, scale: 1 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Project Banner
        </CardTitle>
        <CardDescription>
          Upload a JPG banner image for your project (recommended size: 1200x400px)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.banner_image ? (
          <div className="space-y-4">
            {/* Banner Display Section */}
            <div className="relative">
              <div 
                ref={imageContainerRef}
                className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-slate-100 to-slate-200 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={formData.banner_image}
                  alt="Project banner"
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
                    transformOrigin: 'center'
                  }}
                  draggable={false}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeBanner}
                  className="absolute top-3 right-3 shadow-lg z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  Drag to reposition
                </div>
              </div>
            </div>

            {/* Position Controls */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Image Position & Scale</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPosition}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Horizontal (X)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[position.x]}
                      onValueChange={(value) => onInputChange("banner_position", { ...position, x: value[0] })}
                      min={-200}
                      max={200}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-8">{position.x}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Vertical (Y)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[position.y]}
                      onValueChange={(value) => onInputChange("banner_position", { ...position, y: value[0] })}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-8">{position.y}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Scale</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[position.scale]}
                      onValueChange={handleScaleChange}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-8">{position.scale.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Banner Controls */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Replace Banner
              </Button>
              <div className="text-sm text-gray-500 flex items-center">
                Banner is displayed across the top of your project
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Project Banner
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg"
          onChange={handleFileInput}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
