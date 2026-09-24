import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
          src="https://www.googletagmanager.com/gtag/js?id=G-WCRXD74WEM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-WCRXD74WEM');
          `}
        </Script>
      </body>
    </html>
  );
}
