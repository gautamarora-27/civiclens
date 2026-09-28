import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastStack } from "@/components/ui/NotificationToast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Smart Bus Fleet Urban Sensing Platform",
  description:
    "AI-powered municipal bus fleet monitoring — live detections, incident intelligence and urban analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <NotificationProvider>
            {children}
            <ToastStack />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
