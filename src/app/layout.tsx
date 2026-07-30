import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GigTrust - Verified Hourly, Project-Based, and Part-Time Gig Marketplace",
  description: "Connect verified employers with background-checked workers. Real-time GPS check-ins, instant escrow payments, and reliable trust scoring.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        <div className="relative min-h-screen overflow-x-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-900/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gold-950/20 blur-[150px] pointer-events-none" />
          
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
