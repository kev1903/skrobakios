
import React from 'react';
import { useImageEditor } from './hooks/useImageEditor';
import { ImageEditor } from './components/ImageEditor';
import { ProfilePictureDisplay } from './components/ProfilePictureDisplay';

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
  const {
    isEditing,
    tempImage,
    imagePosition,
    imageScale,
    setImageScale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResetPosition,
    handleCancelEdit,
    startEditing,
    finishEditing
  } = useImageEditor();

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      startEditing(result);
    };
    reader.readAsDataURL(file);
  };

  if (isEditing && tempImage) {
    return (
      <ImageEditor
        tempImage={tempImage}
        imagePosition={imagePosition}
        imageScale={imageScale}
        onScaleChange={setImageScale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onReset={handleResetPosition}
        onCancel={handleCancelEdit}
        onFinishEditing={finishEditing}
        onAvatarChange={onAvatarChange}
      />
    );
  }

  return (
    <ProfilePictureDisplay
      avatarUrl={avatarUrl}
      firstName={firstName}
      lastName={lastName}
      onFileSelect={handleFileSelect}
    />
  );
};
