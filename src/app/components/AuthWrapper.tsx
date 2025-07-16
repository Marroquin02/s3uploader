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

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <AuthLoading message={loadingMessage} />;
  }

  // Una vez verificado el estado, mostrar el contenido
  return <>{children}</>;
}