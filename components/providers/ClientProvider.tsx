// app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import AlertProvider from "@/components/providers/AlertProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import MetaPageView from "@/components/analytics/MetaPageView";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <MetaPageView />
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