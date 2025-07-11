
import React, { useRef, useState, useCallback } from 'react';
import { Camera, User, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfilePictureSectionProps {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export const ProfilePictureSection = ({ 
  avatarUrl, 
  firstName, 
  lastName, 
  onAvatarChange 
}: ProfilePictureSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempImage(result);
        setImagePosition({ x: 0, y: 0 });
        setImageScale(1);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  }, [imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSavePosition = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      
      // Draw the positioned image onto canvas
      ctx?.drawImage(
        img,
        imagePosition.x,
        imagePosition.y,
        img.width * imageScale,
        img.height * imageScale
      );
      
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onAvatarChange(croppedDataUrl);
      setIsEditing(false);
    };
    
    img.src = tempImage;
  };

  const handleResetPosition = () => {
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempImage('');
  };

  if (isEditing && tempImage) {
    return (
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-3 text-slate-800">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
              <Move className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl font-semibold">Position Your Photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Image Editor Frame */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64 border-2 border-dashed border-blue-300 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                <div 
                  className="relative w-full h-full cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={tempImage}
                    alt="Preview"
                    className="absolute pointer-events-none select-none"
                    style={{
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: 'top left'
                    }}
                    draggable={false}
                  />
                </div>
                {/* Frame overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full rounded-full border-4 border-blue-500/50"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Drag to position your photo within the circle frame
              </p>
              
              {/* Scale Control */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">Size:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={imageScale}
                  onChange={(e) => setImageScale(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-slate-600 w-12">{Math.round(imageScale * 100)}%</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPosition}
                  className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-blue-50/60"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-red-50/60"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePosition}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  Save Position
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-slate-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xl font-semibold">Profile Picture</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-8">
          <div className="relative group">
            <Avatar className="w-28 h-28 ring-4 ring-white/50 shadow-xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-slate-100 text-blue-600 font-semibold">
                {firstName[0]}{lastName[0]}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm group-hover:scale-110"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 text-lg">Upload a new photo</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Choose a photo that represents you well. Drag to position within the frame after upload.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAvatarClick} 
              className="mt-4 backdrop-blur-sm bg-white/60 border-white/30 hover:bg-blue-50/60 hover:border-blue-200/50 hover:text-blue-600 transition-all duration-200"
            >
              Choose File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
