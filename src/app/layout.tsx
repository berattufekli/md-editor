import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans, Fira_Code, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontProvider } from "@/components/providers/font-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MD Editor - Professional Markdown Editor",
  description: "A powerful and elegant markdown editor built with Next.js, shadcn/ui, and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plusJakartaSans.variable} ${firaCode.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <ThemeProvider defaultTheme="system" storageKey="md-editor-theme">
          <FontProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
