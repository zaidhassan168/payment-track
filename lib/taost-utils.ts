import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "warning" | "info";

interface ShowToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
}

const DEFAULT_TOAST_DURATION = 3000;

const getDefaultTitle = (type: ToastType) => {
  switch (type) {
    case "error": return "Error";
    case "success": return "Success";
    case "warning": return "Warning";
    case "info": return "Information";
  }
};

export const showToast = ({ title, description, type = "info" }: ShowToastOptions) => {
  const variant = type === "error" ? "destructive" : "default";
  
  toast({
    variant,
    title: title ?? getDefaultTitle(type),
    description: description,
    duration: DEFAULT_TOAST_DURATION,
  });
};

// Predefined toast helpers
export const showSuccessToast = (description: string, title?: string) => {
  showToast({ title, description, type: "success" });
};

export const showErrorToast = (description: string, title?: string) => {
  showToast({ title, description, type: "error" });
};