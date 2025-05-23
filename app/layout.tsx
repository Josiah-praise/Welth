import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import ClerkThemeProvider from "@/components/clerk-theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AI Finance Manager",
  description: "Be smart about your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            <header className="border-b fixed py-6 left-0 right-0 top-0 backdrop-blur-sm z-900 shadow-sm">
              <Header />
            </header>
            <main className="mt-[100px] min-h-screen">{children}</main>
            <footer className="text-center dark:bg-gray-900 bg-gray-300/50 mt-5">
              <p className="container mx-auto py-5 ">
                Made with love by Praise
              </p>
            </footer>
          </ClerkThemeProvider>
        </ThemeProvider>
        <Toaster position={ 'top-right'} richColors/>
      </body>
    </html>
  );
}
