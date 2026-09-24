import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paris",
  description:
    "Explore Paris in 1970. Move your cursor to reveal a thousand photographs taken by amateurs for the City of Paris photography contest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}
