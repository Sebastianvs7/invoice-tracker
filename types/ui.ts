import * as React from "react";

export type SpinnerSize = "1" | "2" | "3";

export interface SpinnerProps {
  size?: SpinnerSize;
  loading?: boolean;
  children?: React.ReactNode;
  label?: string;
  className?: string;
}

// Note: ToastProps and ToastActionElement are defined in components/ui/toast.tsx
// to avoid circular dependencies

