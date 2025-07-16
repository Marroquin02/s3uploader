"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH 
    ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` 
    : "/api/auth";
    
  return (
    <SessionProvider basePath={basePath}>
      {children}
    </SessionProvider>
  );
}