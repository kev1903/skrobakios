import React, { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfilePictureDisplayProps {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  onFileSelect: (file: File) => void;
}

export const ProfilePictureDisplay = ({
  avatarUrl,
  firstName,
  lastName,
  onFileSelect
}: ProfilePictureDisplayProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

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