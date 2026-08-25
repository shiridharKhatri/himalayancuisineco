import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

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
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-cream-base text-charcoal">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
