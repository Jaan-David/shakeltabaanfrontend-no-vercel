// app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import AlertProvider from "@/components/providers/AlertProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SessionProvider>
  );
}