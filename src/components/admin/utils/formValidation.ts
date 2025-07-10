import type { UserRole } from '../types';

interface FormData {
  name: string;
  email: string;
  role: UserRole | '';
}

interface ValidationResult {
  isValid: boolean;
  error?: {
    title: string;
    description: string;
  };
}

export const validateInvitationForm = (formData: FormData): ValidationResult => {
  if (!formData.name.trim()) {
    return {
      isValid: false,
      error: {
        title: "Validation Error",
        description: "Name is required",
      },
    };
  }

  if (!formData.email.trim()) {
    return {
      isValid: false,
      error: {
        title: "Validation Error",
        description: "Email is required",
      },
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return {
      isValid: false,
      error: {
        title: "Validation Error",
        description: "Please enter a valid email address",
      },
    };
  }

  if (!formData.role) {
    return {
      isValid: false,
      error: {
        title: "Validation Error",
        description: "Role is required",
      },
    };
  }

  return { isValid: true };
};