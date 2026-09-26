import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import Script from "next/script";
const GA_MEASUREMENT_ID = "G-WCRXD74WEM";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paris, 1970.",
  description:
    "Explore Paris in 1970. Move your cursor to reveal a thousand photographs taken by amateurs for the City of Paris photography contest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden font-sans">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
