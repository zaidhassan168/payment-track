import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "warning" | "info";

interface ShowToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
}

export const showToast = ({ title, description, type = "info" }: ShowToastOptions) => {
  const variant = type === "error" ? "destructive" : "default";
  
  toast({
    variant,
    title: title ?? (type === "error" ? "Error" : "Success"),
    description: description,
    duration: 3000,
  });
};

// Predefined toast helpers
export const showSuccessToast = (description: string, title?: string) => {
  showToast({ title, description, type: "success" });
};

export const showErrorToast = (description: string, title?: string) => {
  showToast({ title, description, type: "error" });
};