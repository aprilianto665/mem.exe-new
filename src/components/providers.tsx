"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        containerStyle={{
          bottom: 100,
        }}
        toastOptions={{ duration: 3000 }}
      />
    </SessionProvider>
  );
}
