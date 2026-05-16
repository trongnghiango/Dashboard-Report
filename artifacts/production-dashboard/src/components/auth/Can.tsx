import React from "react";
import { useAuthStore } from "../../stores/auth";

interface CanProps {
  I: string;
  a: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ I, a, children, fallback = null }) => {
  const can = useAuthStore((state) => state.can);

  if (can(a, I)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
