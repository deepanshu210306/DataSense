"use client";

import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            theme === "dark"
              ? "bg-neutral-950/95 backdrop-blur-xl border border-white/10 text-neutral-100 shadow-xl"
              : "bg-white/95 backdrop-blur-xl border border-black/10 text-neutral-900 shadow-xl",
        },
      }}
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
