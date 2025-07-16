"use client";

import { useAuth } from "../hooks/useAuth";
import AuthLoading from "./AuthLoading";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function AuthWrapper({ 
  children, 
  loadingMessage = "Verificando autenticación..." 
}: AuthWrapperProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading message={loadingMessage} />;
  }

  return <>{children}</>;
}