import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RH PARIS",
  description: "RH Paris - The Gallery on the Champs Élysées"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Permissions-Policy" content="fullscreen=(self)" />
        <meta name="fullscreen-allowed" content="true" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} style={{ backgroundColor: "#000" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
