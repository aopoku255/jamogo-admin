import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/QueryProvider";
import { AdminGate } from "@/components/AdminGate";
import { DashboardShell } from "@/components/layout/DashboardShell";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jamogo Admin",
  description: "Internal admin portal for Jamogo.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AdminGate>
            <DashboardShell>{children}</DashboardShell>
          </AdminGate>
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
