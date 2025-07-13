import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePlatformAuth } from '@/hooks/usePlatformAuth';
import { PlatformAuthForm } from './PlatformAuthForm';
import { FirstLoginPasswordChange } from '@/components/auth/FirstLoginPasswordChange';

interface PlatformAuthPageProps {
  onNavigate: (page: string) => void;
}

export const PlatformAuthPage = ({ onNavigate }: PlatformAuthPageProps) => {
  const {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    showPassword,
    setShowPassword,
    error,
    tokenAccessUser,
    showPasswordChange,
    handleSubmit,
    toggleMode,
    handlePasswordChangeComplete
  } = usePlatformAuth(onNavigate);

  // Show password change form if user requires it
  if (showPasswordChange && tokenAccessUser?.requiresPasswordChange) {
    return (
      <FirstLoginPasswordChange
        userEmail={tokenAccessUser.email}
        onPasswordChanged={handlePasswordChangeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <PlatformAuthForm
          isLogin={isLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isLoading={isLoading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          onSubmit={handleSubmit}
          onToggleMode={toggleMode}
        />
      </div>
    </div>
  );
};