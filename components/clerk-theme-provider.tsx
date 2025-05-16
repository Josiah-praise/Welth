"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { Appearance } from "@clerk/types";
import {dark} from "@clerk/themes"

function ClerkThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const {  systemTheme, theme } = useTheme();
  const [appearance, setAppearance] = useState<undefined | Appearance>(
    undefined
  );

    useEffect(() => {
        if (!theme) return;

        if (theme === 'system') {
            switch (systemTheme) {
                case 'dark':
                    setAppearance({ baseTheme: dark })
                    return
                default:
                    setAppearance(undefined);
                    return
            }
        }
    
  }, [systemTheme, theme]);
  return (
    <ClerkProvider appearance={appearance} afterSignOutUrl={"/"}>
      {children}
    </ClerkProvider>
  );
}
export default ClerkThemeProvider;
