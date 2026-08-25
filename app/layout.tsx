import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Himalayan Cuisine Co.",
    default: "Himalayan Cuisine Co. | Premium Nepalese Dining & Online Ordering",
  },
  description: "Experience authentic premium Himalayan and Nepalese cuisine. Handcrafted momos, traditional curries, reservation, online ordering, catering, and loyalty rewards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-base text-charcoal">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
