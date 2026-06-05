import NextAuthProvider from "@/provider/NextAuthProvider";
import TanStackQueryProvider from "@/provider/TanstackProvider";
import { ThemeProvider } from "@/provider/theme-provider";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { LoginModal } from "@/components/auth/LoginModal";
import { UserSettingsSheet } from "@/components/settings/UserSettingsSheet";
import AgChartsInitializer from "@/components/ui/AgChartsInitializer";
import { Toaster } from "@/components/ui/sonner";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presentation AI",
  description: "AI-powered presentation creation and editing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanStackQueryProvider>
      <NextAuthProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AgChartsInitializer>
                {children}
                <LoginModal />
                <UserSettingsSheet />
                <Toaster richColors position="top-right" />
              </AgChartsInitializer>
            </ThemeProvider>
          </body>
        </html>
      </NextAuthProvider>
    </TanStackQueryProvider>
  );
}
