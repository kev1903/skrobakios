import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as originalToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// List of deprecated error messages to filter
const DEPRECATED_TOAST_PATTERNS = [
  'failed to load digital objects',
  'failed to load digital',
  'digital objects',
  'digitalobjects',
  'digital_objects',
  'digital object'
];

const shouldFilterToastMessage = (message: any): boolean => {
  const stringMessage = String(message || '').toLowerCase();
  return DEPRECATED_TOAST_PATTERNS.some(pattern => 
    stringMessage.includes(pattern.toLowerCase())
  );
};

// Wrap the original toast to filter deprecated messages
const toast = {
  ...originalToast,
  error: (...args: any[]) => {
    const [message, data] = args;
    if (shouldFilterToastMessage(message) || 
        (data?.description && shouldFilterToastMessage(data.description))) {
      console.warn('🚫 Filtered deprecated digital objects error toast');
      return;
    }
    return originalToast.error(message, data);
  },
  success: (...args: any[]) => {
    const [message, data] = args;
    if (shouldFilterToastMessage(message)) {
      console.warn('🚫 Filtered deprecated digital objects success toast');
      return;
    }
    return originalToast.success(message, data);
  },
  warning: (...args: any[]) => {
    const [message, data] = args;
    if (shouldFilterToastMessage(message)) {
      console.warn('🚫 Filtered deprecated digital objects warning toast');
      return;
    }
    return originalToast.warning(message, data);
  },
  info: (...args: any[]) => {
    const [message, data] = args;
    if (shouldFilterToastMessage(message)) {
      console.warn('🚫 Filtered deprecated digital objects info toast');
      return;
    }
    return originalToast.info(message, data);
  },
  message: (...args: any[]) => {
    const [message, data] = args;
    if (shouldFilterToastMessage(message)) {
      console.warn('🚫 Filtered deprecated digital objects message toast');
      return;
    }
    return originalToast.message(message, data);
  },
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
