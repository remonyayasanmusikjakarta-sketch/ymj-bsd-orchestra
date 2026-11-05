import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YMJ BSD Community Orchestra · Open Recruitment",
  description:
    "Open Recruitment — Become a Founding Member of the YMJ BSD Community Orchestra. Strings, Woodwinds, Brass & Percussion. Saturday 14.00–17.00 WIB at Yayasan Musik Jakarta Campus BSD. Target concert: February 2027.",
  keywords: [
    "YMJ BSD Community Orchestra",
    "Open Recruitment",
    "Founding Member",
    "Yayasan Musik Jakarta",
    "Community Orchestra",
    "Junior Orchestra",
    "Orchestra Audition",
    "BSD Tangerang",
  ],
  authors: [{ name: "Yayasan Musik Jakarta" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YMJ BSD Orchestra",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "YMJ BSD Community Orchestra — Open Recruitment",
    description:
      "Become a Founding Member. Strings, Woodwinds, Brass & Percussion. Saturday 14.00–17.00 WIB at YMJ BSD Campus. Target concert: February 2027.",
    siteName: "YMJ BSD Community Orchestra",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YMJ BSD Community Orchestra — Open Recruitment",
    description:
      "Become a Founding Member. Saturday 14.00–17.00 WIB at YMJ BSD Campus. Target concert: February 2027.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA: Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered:', registration.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
